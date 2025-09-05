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
import { Role, User } from 'src/domain/chat/entities/user';
import { Code, CodeType } from 'src/domain/chat/entities/code';

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
      invitationExists.invitedEmail === email;

    if (!isInvitationValid) {
      return left(new ResourceInvalidError('Invitation'));
    }

    const hashedPassword = await this.hashGenerator.hash(password);

    const user = User.create({
      email,
      name,
      companyId: invitationExists.companyId,
      role: Role.USER,
      password: hashedPassword,
    });

    await Promise.all([
      this.userRepository.create(user),
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

    const code = Code.create({
      userId: user.id,
      value: refreshToken,
      type: CodeType.REFRESH_TOKEN,
      expiresAt: expiresAt,
    });

    await this.codeRepository.create(code);

    return right({ accessToken, refreshToken });
  }
}
