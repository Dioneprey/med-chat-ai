import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { Encrypter } from '../../cryptography/encrypter';
import { UserRepository } from '../../repositories/user.repository';
import { HashComparer } from '../../cryptography/hash-comparer';
import { WrongCredentialsError } from '../@errors/wrong-credentials';
import { CodeRepository } from '../../repositories/code.repository';

interface AuthenticateUseCaseRequest {
  email: string;
  password: string;
}

type AuthenticateUseCaseResponse = Either<
  WrongCredentialsError,
  {
    accessToken: string;
    refreshToken: string;
  }
>;

@Injectable()
export class AuthenticateUseCase {
  constructor(
    private userRepository: UserRepository,
    private encrypter: Encrypter,
    private hashComparer: HashComparer,
    private codeRepository: CodeRepository,
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    const userExists = await this.userRepository.findByUniqueField({
      key: 'email',
      value: email,
    });

    if (!userExists) {
      return left(new WrongCredentialsError());
    }

    const isPasswordValid = await this.hashComparer.compare(
      password,
      userExists.password,
    );

    if (!isPasswordValid) {
      return left(new WrongCredentialsError());
    }

    const accessToken = await this.encrypter.encrypt({
      sub: userExists.id,
      role: userExists.role,
      companyId: userExists.companyId,
    });

    const refreshToken = await this.encrypter.encrypt({
      sub: userExists.id,
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.codeRepository.deleteByUserId({
      userId: userExists.id,
      type: 'REFRESH_TOKEN',
    });

    await this.codeRepository.create({
      userId: userExists.id,
      value: refreshToken,
      type: 'REFRESH_TOKEN',
      expiresAt: expiresAt,
    });

    return right({ accessToken, refreshToken });
  }
}
