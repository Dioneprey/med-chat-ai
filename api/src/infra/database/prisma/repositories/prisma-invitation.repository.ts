import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { Invitation as PrismaInvitation } from '@generated/index';
import {
  InvitationRepository,
  InvitationRepositoryFindByUniqueFieldProps,
} from 'src/domain/chat/application/repositories/invitation.repository';
import { RedisRepository } from '../../redis/redis.service';
import { PrismaInvitationMapper } from '../mappers/prisma-invitation-mapper';
import { Invitation, InvitationKey } from 'src/domain/chat/entities/invitation';

@Injectable()
export class PrismaInvitationRepository implements InvitationRepository {
  constructor(
    private prisma: PrismaService,
    private redisRepository: RedisRepository,
  ) {}
  async findByUniqueField({
    key,
    value,
  }: InvitationRepositoryFindByUniqueFieldProps) {
    const cacheKey = `invitation:${key}:${value}`;
    const cached = await this.redisRepository.get<PrismaInvitation>(cacheKey);

    if (cached) return PrismaInvitationMapper.toDomain(cached);

    if (!value) return null;

    const prismaInvitation = await this.prisma.invitation.findFirst({
      where: {
        [key]: value,
      },
    });

    if (!prismaInvitation) {
      return null;
    }

    await this.redisRepository.set(cacheKey, prismaInvitation, 180);

    return PrismaInvitationMapper.toDomain(prismaInvitation);
  }

  async create(invitation: Invitation) {
    const data = PrismaInvitationMapper.toPrisma(invitation);

    const createdInvitation = await this.prisma.invitation.create({
      data: data,
    });

    return PrismaInvitationMapper.toDomain(createdInvitation);
  }

  async save(invitation: Invitation) {
    const data = PrismaInvitationMapper.toPrisma(invitation);

    const updatedUser = await this.prisma.invitation.update({
      where: {
        id: data.id,
      },
      data: data,
    });

    for (const key of Object.keys(data) as InvitationKey[]) {
      await this.redisRepository.del(`invitation:${key}:${data[key]}`);
    }

    return PrismaInvitationMapper.toDomain(updatedUser);
  }

  async delete(invitation: Invitation): Promise<void> {
    const data = PrismaInvitationMapper.toPrisma(invitation);

    await this.prisma.invitation.delete({
      where: {
        id: data.id,
      },
    });

    for (const key of Object.keys(data) as InvitationKey[]) {
      await this.redisRepository.del(`invitation:${key}:${data[key]}`);
    }
  }
}
