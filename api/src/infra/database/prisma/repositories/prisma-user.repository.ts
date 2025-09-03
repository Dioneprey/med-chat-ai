import { Injectable } from '@nestjs/common';
import {
  UserRepository,
  UserRepositoryFindByUniqueFieldProps,
} from 'src/domain/chat/application/repositories/user.repository';
import { PrismaService } from '../prisma.service';
import { User } from '@generated/index';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaService) {}
  async findByUniqueField({
    key,
    value,
    include,
  }: UserRepositoryFindByUniqueFieldProps) {
    if (!value) return null;

    return await this.prisma.user.findFirst({
      where: {
        [key]: value,
      },
      include: {
        company: include?.company,
      },
    });
  }

  async create(user: User) {
    return await this.prisma.user.create({
      data: {
        ...user,
        createdAt: new Date(),
      },
    });
  }

  async save(user: User) {
    return await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: user,
    });
  }

  async delete(userId: string): Promise<void> {
    await this.prisma.user.delete({
      where: {
        id: userId,
      },
    });
  }
}
