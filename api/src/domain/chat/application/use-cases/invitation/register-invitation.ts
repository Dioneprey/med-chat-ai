import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { ResourceNotFoundError } from '../@errors/resource-not-found.error';
import { UserRepository } from '../../repositories/user.repository';
import { InvitationRepository } from '../../repositories/invitation.repository';
import { ResourceInvalidError } from '../@errors/resource-invalid.error';
import { ResourceAlreadyExists } from '../@errors/resource-already-exists.error';
import { ForbiddenError } from '../@errors/forbidden.error';
import { generateCode } from 'src/core/helpers/generate-code';
import { EmailTemplate } from 'src/core/types/email-template';
import { SendEmailSchedule } from '../../schedules/send-email.schedule';
import { Invitation } from 'src/domain/chat/entities/invitation';

interface RegisterInvitationUseCaseRequest {
  userId: string;
  invitedEmail: string;
}

type RegisterInvitationUseCaseResponse = Either<
  | ResourceNotFoundError
  | ResourceInvalidError
  | ResourceAlreadyExists
  | ForbiddenError,
  undefined
>;

@Injectable()
export class RegisterInvitationUseCase {
  constructor(
    private userRepository: UserRepository,
    private invitationRepository: InvitationRepository,
    private sendEmailSchedule: SendEmailSchedule,
  ) {}

  async execute({
    userId,
    invitedEmail,
  }: RegisterInvitationUseCaseRequest): Promise<RegisterInvitationUseCaseResponse> {
    const [userExists, invitationAlreadyExists] = await Promise.all([
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

    if (invitationAlreadyExists) {
      return left(
        new ResourceAlreadyExists(`An invitation for ${invitedEmail}`),
      );
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitationCode = generateCode(6);

    const invitation = Invitation.create({
      companyId: userExists.companyId,
      invitedEmail,
      code: invitationCode,
      expiresAt,
    });

    await this.invitationRepository.create(invitation);

    const companyName = userExists!.company!.name;

    await this.sendEmailSchedule.enqueueJob({
      recipientEmail: invitedEmail,
      template: EmailTemplate.INVITATION,
      variables: {
        invitationCode: invitationCode,
        companyName: companyName,
      },
      subject: `Convite para se juntar à ${companyName}!`,
    });

    return right(undefined);
  }
}
