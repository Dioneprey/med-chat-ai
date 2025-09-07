import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Role, User, UserProps } from 'src/domain/auth/entities/user';
import { PrismaUserMapper } from 'src/infra/database/prisma/mappers/prisma-user-mapper';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';

export function makeUser(
  override: Partial<UserProps> = {},
  id?: UniqueEntityID,
) {
  const user = User.create(
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      companyId: override.companyId || new UniqueEntityID(),
      role: override.role ? Role[override.role] : Role.USER,
      ...override,
    },
    id,
  );

  return user;
}

@Injectable()
export class UserFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaUser(data: Partial<UserProps> = {}): Promise<User> {
    const user = makeUser(data);

    await this.prisma.user.create({
      data: PrismaUserMapper.toPrisma(user),
    });

    return user;
  }
}
