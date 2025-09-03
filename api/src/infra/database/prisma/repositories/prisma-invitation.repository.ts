import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { Invitation } from '@generated/index';
import {
  InvitationRepository,
  InvitationRepositoryFindByUniqueFieldProps,
} from 'src/domain/qa/application/repositories/invitation.repository';

@Injectable()
export class PrismaInvitationRepository implements InvitationRepository {
  constructor(private prisma: PrismaService) {}
  async findByUniqueField({
    key,
    value,
  }: InvitationRepositoryFindByUniqueFieldProps) {
    if (!value) return null;

    return await this.prisma.invitation.findFirst({
      where: {
        [key]: value,
      },
    });
  }

  async create(invitation: Invitation) {
    return await this.prisma.invitation.create({
      data: {
        ...invitation,
        createdAt: new Date(),
      },
    });
  }

  async save(invitation: Invitation) {
    return await this.prisma.invitation.update({
      where: {
        id: invitation.id,
      },
      data: invitation,
    });
  }

  async delete(invitationId: string): Promise<void> {
    await this.prisma.invitation.delete({
      where: {
        id: invitationId,
      },
    });
  }
}
