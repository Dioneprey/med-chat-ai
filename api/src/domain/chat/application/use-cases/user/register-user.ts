import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { Encrypter } from '../../cryptography/encrypter';
import { ResourceNotFoundError } from '../@errors/resource-not-found.error';
import { UserRepository } from '../../repositories/user.repository';
import { InvitationRepository } from '../../repositories/invitation.repository';
import { ResourceInvalidError } from '../@errors/resource-invalid.error';
import { ResourceAlreadyExists } from '../@errors/resource-already-exists.error';
import { HashGenerator } from '../../cryptography/hash-generator';
import { CodeRepository } from '../../repositories/code.repository';

interface RegisterUserUseCaseRequest {
  name: string;
  email: string;
  password: string;
  invitationCode: string;
}

type RegisterUserUseCaseResponse = Either<
  ResourceNotFoundError | ResourceInvalidError | ResourceAlreadyExists,
  {
    accessToken: string;
  }
>;

@Injectable()
export class RegisterUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private invitationRepository: InvitationRepository,
    private codeRepository: CodeRepository,
    private encrypter: Encrypter,
    private hashGenerator: HashGenerator,
  ) {}

  async execute({
    email,
    password,
    name,
    invitationCode,
  }: RegisterUserUseCaseRequest): Promise<RegisterUserUseCaseResponse> {
    const [userWithSameEmailExists, invitationExists] = await Promise.all([
      this.userRepository.findByUniqueField({
        key: 'email',
        value: email,
      }),
      this.invitationRepository.findByUniqueField({
        key: 'code',
        value: invitationCode,
      }),
    ]);

    if (userWithSameEmailExists) {
      return left(new ResourceAlreadyExists(`User with email: ${email}`));
    }

    if (!invitationExists) {
      return left(
        new ResourceNotFoundError(`Invitation with code: ${invitationCode},`),
      );
    }

    const now = Date.now();

    const isInvitationValid =
      invitationExists.expiresAt.getTime() > now &&
      invitationExists.invitedEmail === email &&
      invitationExists.used === false;

    if (!isInvitationValid) {
      return left(new ResourceInvalidError('Invitation'));
    }

    const hashedPassword = await this.hashGenerator.hash(password);

    const [user] = await Promise.all([
      this.userRepository.create({
        email,
        name,
        companyId: invitationExists.companyId,
        role: 'USER',
        password: hashedPassword,
      }),
      this.invitationRepository.delete(invitationExists),
    ]);

    const accessToken = await this.encrypter.encrypt({
      sub: user.id,
      role: user.role,
      companyId: user.companyId,
    });

    const refreshToken = await this.encrypter.encrypt({
      sub: user.id,
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.codeRepository.create({
      userId: user.id,
      value: refreshToken,
      type: 'REFRESH_TOKEN',
      expiresAt: expiresAt,
    });

    return right({ accessToken, refreshToken });
  }
}
