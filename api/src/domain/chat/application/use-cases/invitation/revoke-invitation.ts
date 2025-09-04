import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { ResourceNotFoundError } from '../@errors/resource-not-found.error';
import { UserRepository } from '../../repositories/user.repository';
import { InvitationRepository } from '../../repositories/invitation.repository';
import { ForbiddenError } from '../@errors/forbidden.error';

interface RevokeInvitationUseCaseRequest {
  userId: string;
  invitedEmail: string;
}

type RevokeInvitationUseCaseResponse = Either<
  ResourceNotFoundError | ForbiddenError,
  undefined
>;

@Injectable()
export class RevokeInvitationUseCase {
  constructor(
    private userRepository: UserRepository,
    private invitationRepository: InvitationRepository,
  ) {}

  async execute({
    userId,
    invitedEmail,
  }: RevokeInvitationUseCaseRequest): Promise<RevokeInvitationUseCaseResponse> {
    const [userExists, invitationExists] = await Promise.all([
      this.userRepository.findByUniqueField({
        key: 'id',
        value: userId,
        include: {
          company: true,
        },
      }),
      this.invitationRepository.findByUniqueField({
        key: 'invitedEmail',
        value: invitedEmail,
      }),
    ]);

    if (!userExists) {
      return left(new ResourceNotFoundError(`User with id: ${userId}`));
    }

    const canManageCompany = userExists.role === 'ADMIN';

    if (!canManageCompany) {
      return left(new ForbiddenError());
    }

    if (!invitationExists) {
      return left(
        new ResourceNotFoundError(`An invitation for ${invitedEmail}`),
      );
    }
    await this.invitationRepository.delete(invitationExists);

    return right(undefined);
  }
}
