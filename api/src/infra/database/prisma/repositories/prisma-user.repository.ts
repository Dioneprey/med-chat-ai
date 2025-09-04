import { Injectable } from '@nestjs/common';
import {
  UserKey,
  UserRepository,
  UserRepositoryCountProps,
  UserRepositoryFindByUniqueFieldProps,
} from 'src/domain/chat/application/repositories/user.repository';
import { PrismaService } from '../prisma.service';
import { User } from '@generated/index';
import { RedisRepository } from '../../redis/redis.service';

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
    const cached = await this.redisRepository.get<User>(cacheKey);

    if (cached) return cached;

    if (!value) return null;

    const user = await this.prisma.user.findFirst({
      where: {
        [key]: value,
      },
      include: {
        company: include?.company,
      },
    });

    await this.redisRepository.set(cacheKey, user, 60);

    return user;
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
    const createdUser = await this.prisma.user.create({
      data: {
        ...user,
        createdAt: new Date(),
      },
    });

    await this.redisRepository.purgeByPrefix(
      `company:${user.companyId}:usersCount`,
    );

    return createdUser;
  }

  async save(user: User) {
    const updatedUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: user,
    });

    for (const key of Object.keys(user) as UserKey[]) {
      await this.redisRepository.del(`user:${key}:${user[key]}`);
    }
    await this.redisRepository.purgeByPrefix(
      `company:${user.companyId}:usersCount`,
    );

    return updatedUser;
  }

  async delete(user: User): Promise<void> {
    await this.prisma.user.delete({
      where: {
        id: user.id,
      },
    });

    for (const key of Object.keys(user) as UserKey[]) {
      await this.redisRepository.del(`user:${key}:${user[key]}`);
    }
    await this.redisRepository.purgeByPrefix(
      `company:${user.companyId}:usersCount`,
    );
  }
}
