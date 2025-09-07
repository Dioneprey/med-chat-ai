import { Injectable } from '@nestjs/common';
import {
  CodeRepository,
  CodeRepositoryDeleteByUserIdProps,
  CodeRepositoryFindByUniqueFieldProps,
} from 'src/domain/auth/application/repositories/code.repository';
import { PrismaService } from '../prisma.service';
import { PrismaCodeMapper } from '../mappers/prisma-code-mapper';
import { Code } from 'src/domain/auth/entities/code';

@Injectable()
export class PrismaCodeRepository implements CodeRepository {
  constructor(private prisma: PrismaService) {}
  async findByUniqueField({
    key,
    value,
  }: CodeRepositoryFindByUniqueFieldProps) {
    const prismaCode = await this.prisma.code.findFirst({
      where: {
        [key]: value,
      },
    });

    if (!prismaCode) {
      return null;
    }

    return PrismaCodeMapper.toDomain(prismaCode);
  }

  async create(code: Code) {
    const data = PrismaCodeMapper.toPrisma(code);

    const createdCode = await this.prisma.code.create({
      data: data,
    });

    return PrismaCodeMapper.toDomain(createdCode);
  }

  async save(code: Code) {
    const data = PrismaCodeMapper.toPrisma(code);

    const editedCode = await this.prisma.code.update({
      where: {
        id: data.id,
      },
      data: data,
    });

    return PrismaCodeMapper.toDomain(editedCode);
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
