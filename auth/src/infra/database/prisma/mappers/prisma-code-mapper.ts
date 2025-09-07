import { Prisma, Code as PrismaCode } from '@generated/index';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Code, CodeType } from 'src/domain/auth/entities/code';

export class PrismaCodeMapper {
  static toDomain(raw: PrismaCode): Code {
    return Code.create(
      {
        ...raw,
        userId: new UniqueEntityID(raw.userId),
        type: CodeType[raw.type],
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(code: Code): Prisma.CodeUncheckedCreateInput {
    return {
      id: code.id.toString(),
      userId: code.userId.toString(),
      value: code.value,
      type: code.type,
      createdAt: code.createdAt,
      expiresAt: code.expiresAt,
    };
  }
}
