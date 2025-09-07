import { Prisma, Invitation as PrismaInvitation } from '@generated/index';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Invitation } from 'src/domain/auth/entities/invitation';

export class PrismaInvitationMapper {
  static toDomain(raw: PrismaInvitation): Invitation {
    return Invitation.create(
      {
        ...raw,
        companyId: new UniqueEntityID(raw.companyId),
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(
    invitation: Invitation,
  ): Prisma.InvitationUncheckedCreateInput {
    return {
      id: invitation.id.toString(),
      companyId: invitation.companyId.toString(),
      invitedEmail: invitation.invitedEmail,
      code: invitation.code,
      createdAt: invitation.createdAt,
      expiresAt: invitation.expiresAt,
    };
  }
}
