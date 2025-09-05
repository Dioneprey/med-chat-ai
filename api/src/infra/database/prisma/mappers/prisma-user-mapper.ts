import {
  Prisma,
  User as PrismaUser,
  Company as PrismaCompany,
} from '@generated/index';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Role, User } from 'src/domain/chat/entities/user';
import { PrismaCompanyMapper } from './prisma-company-mapper';

export type UserWithInclude = PrismaUser & {
  company?: PrismaCompany | null;
};

export class PrismaUserMapper {
  static toDomain(raw: UserWithInclude): User {
    return User.create(
      {
        ...raw,
        companyId: new UniqueEntityID(raw.companyId),
        company: raw.company
          ? PrismaCompanyMapper.toDomain(raw.company)
          : undefined,
        role: Role[raw.role],
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(user: User): Prisma.UserUncheckedCreateInput {
    return {
      id: user.id.toString(),
      companyId: user.companyId.toString(),
      role: user.role,
      name: user.name,
      email: user.email,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
