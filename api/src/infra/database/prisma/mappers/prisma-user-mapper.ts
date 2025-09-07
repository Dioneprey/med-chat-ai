import { Prisma, User as PrismaUser } from '@generated/index';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Role, User } from 'src/domain/chat/entities/user';

export class PrismaUserMapper {
  static toDomain(raw: PrismaUser): User {
    return User.create(
      {
        ...raw,
        companyId: new UniqueEntityID(raw.companyId),
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
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
