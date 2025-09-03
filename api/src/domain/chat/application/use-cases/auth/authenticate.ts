import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { Encrypter } from '../../cryptography/encrypter';
import { ResourceNotFoundError } from '../@errors/resource-not-found.error';
import { UserRepository } from '../../repositories/user.repository';
import { HashComparer } from '../../cryptography/hash-comparer';
import { WrongCredentialsError } from '../@errors/wrong-credentials';

interface AuthenticateUseCaseRequest {
  email: string;
  password: string;
}

type AuthenticateUseCaseResponse = Either<
  WrongCredentialsError | ResourceNotFoundError,
  {
    accessToken: string;
  }
>;

@Injectable()
export class AuthenticateUseCase {
  constructor(
    private userRepository: UserRepository,
    private encrypter: Encrypter,
    private hashComparer: HashComparer,
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
      return left(new ResourceNotFoundError(`User with email: ${email}`));
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

    return right({ accessToken });
  }
}
