import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Company, CompanyProps } from 'src/domain/chat/entities/company';
import { PrismaCompanyMapper } from 'src/infra/database/prisma/mappers/prisma-company-mapper';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';

export function makeCompany(
  override: Partial<CompanyProps> = {},
  id?: UniqueEntityID,
) {
  const company = Company.create(
    {
      name: faker.company.name(),
      ...override,
    },
    id,
  );

  return company;
}

@Injectable()
export class CompanyFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaCompany(data: Partial<CompanyProps> = {}): Promise<Company> {
    const company = makeCompany(data);

    await this.prisma.company.create({
      data: PrismaCompanyMapper.toPrisma(company),
    });

    return company;
  }
}
