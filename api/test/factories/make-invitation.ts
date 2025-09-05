import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import {
  Invitation,
  InvitationProps,
} from 'src/domain/chat/entities/invitation';
import { PrismaInvitationMapper } from 'src/infra/database/prisma/mappers/prisma-invitation-mapper';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';

export function makeInvitation(
  override: Partial<InvitationProps> = {},
  id?: UniqueEntityID,
) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invitation = Invitation.create(
    {
      invitedEmail: faker.internet.email(),
      companyId: override.companyId || new UniqueEntityID(),
      code: randomUUID(),
      expiresAt: expiresAt,
      ...override,
    },
    id,
  );

  return invitation;
}

@Injectable()
export class InvitationFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaInvitation(
    data: Partial<InvitationProps> = {},
  ): Promise<Invitation> {
    const invitation = makeInvitation(data);

    await this.prisma.invitation.create({
      data: PrismaInvitationMapper.toPrisma(invitation),
    });

    return invitation;
  }
}
