import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Code, CodeProps, CodeType } from 'src/domain/auth/entities/code';
import { PrismaCodeMapper } from 'src/infra/database/prisma/mappers/prisma-code-mapper';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';

export function makeCode(
  override: Partial<CodeProps> = {},
  id?: UniqueEntityID,
) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  const code = Code.create(
    {
      userId: override.userId || new UniqueEntityID(),
      value: randomUUID(),
      type: override.type || CodeType.REFRESH_TOKEN,
      expiresAt,
      ...override,
    },
    id,
  );

  return code;
}

@Injectable()
export class CodeFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaCode(data: Partial<CodeProps> = {}): Promise<Code> {
    const code = makeCode(data);

    await this.prisma.code.create({
      data: PrismaCodeMapper.toPrisma(code),
    });

    return code;
  }
}
