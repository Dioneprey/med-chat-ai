import { Injectable } from '@nestjs/common';
import {
  UserRepository,
  UserRepositoryCountProps,
  UserRepositoryFindByUniqueFieldProps,
} from 'src/domain/chat/application/repositories/user.repository';
import { PrismaService } from '../prisma.service';
import { RedisRepository } from '../../redis/redis.service';
import { User, UserKey } from 'src/domain/chat/entities/user';
import {
  PrismaUserMapper,
  UserWithInclude,
} from '../mappers/prisma-user-mapper';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(
    private prisma: PrismaService,
    private redisRepository: RedisRepository,
  ) {}
  async findByUniqueField({
    key,
    value,
    include,
  }: UserRepositoryFindByUniqueFieldProps) {
    const cacheKey = `user:${key}:${value}`;
    const cached = await this.redisRepository.get<UserWithInclude>(cacheKey);

    if (cached) return PrismaUserMapper.toDomain(cached);

    const prismaUser = await this.prisma.user.findFirst({
      where: {
        [key]: value,
      },
      include: {
        company: include?.company,
      },
    });

    if (!prismaUser) {
      return null;
    }

    await this.redisRepository.set(cacheKey, prismaUser, 180);

    return PrismaUserMapper.toDomain(prismaUser);
  }

  async count({
    companyId,
    from,
    to,
  }: UserRepositoryCountProps): Promise<number> {
    const cacheKey = `company:${companyId}:usersCount:${from?.toISOString()}:${to?.toISOString()}`;

    const cached = await this.redisRepository.get<number>(cacheKey);
    if (cached) {
      return cached;
    }

    const where: any = { companyId };

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = from;
      if (to) where.createdAt.lte = to;
    }

    const count = await this.prisma.user.count({
      where,
    });

    await this.redisRepository.set(cacheKey, count, 180);

    return count;
  }

  async create(user: User) {
    const data = PrismaUserMapper.toPrisma(user);

    const createdUser = await this.prisma.user.create({
      data,
    });

    await this.redisRepository.purgeByPrefix(
      `company:${data.companyId}:usersCount`,
    );

    return PrismaUserMapper.toDomain(createdUser);
  }

  async save(user: User) {
    const data = PrismaUserMapper.toPrisma(user);

    const updatedUser = await this.prisma.user.update({
      where: {
        id: data.id,
      },
      data: data,
    });

    for (const key of Object.keys(data) as UserKey[]) {
      await this.redisRepository.del(`user:${key}:${data[key]}`);
    }
    await this.redisRepository.purgeByPrefix(
      `company:${data.companyId}:usersCount`,
    );

    return PrismaUserMapper.toDomain(updatedUser);
  }

  async delete(user: User): Promise<void> {
    const data = PrismaUserMapper.toPrisma(user);

    await this.prisma.user.delete({
      where: {
        id: data.id,
      },
    });

    for (const key of Object.keys(data) as UserKey[]) {
      await this.redisRepository.del(`user:${key}:${data[key]}`);
    }
    await this.redisRepository.purgeByPrefix(
      `company:${data.companyId}:usersCount`,
    );
  }
}
