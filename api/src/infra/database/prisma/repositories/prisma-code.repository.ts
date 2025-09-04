import { Injectable } from '@nestjs/common';
import {
  CodeRepository,
  CodeRepositoryDeleteByUserIdProps,
  CodeRepositoryFindByUniqueFieldProps,
} from 'src/domain/chat/application/repositories/code.repository';
import { PrismaService } from '../prisma.service';
import { Code } from '@generated/index';

@Injectable()
export class PrismaCodeRepository implements CodeRepository {
  constructor(private prisma: PrismaService) {}
  async findByUniqueField({
    key,
    value,
  }: CodeRepositoryFindByUniqueFieldProps) {
    if (!value) return null;

    return await this.prisma.code.findFirst({
      where: {
        [key]: value,
      },
    });
  }

  async create(code: Code) {
    return await this.prisma.code.create({
      data: {
        ...code,
        createdAt: new Date(),
      },
    });
  }

  async save(code: Code) {
    return await this.prisma.code.update({
      where: {
        id: code.id,
      },
      data: code,
    });
  }

  async deleteByUserId({
    userId,
    type,
  }: CodeRepositoryDeleteByUserIdProps): Promise<void> {
    await this.prisma.code.deleteMany({
      where: {
        userId,
        type,
      },
    });
  }
}
