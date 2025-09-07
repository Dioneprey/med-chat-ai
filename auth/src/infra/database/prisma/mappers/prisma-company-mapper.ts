import { Prisma, Company as PrismaCompany } from '@generated/index';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Company } from 'src/domain/auth/entities/company';

export class PrismaCompanyMapper {
  static toDomain(raw: PrismaCompany): Company {
    return Company.create(
      {
        ...raw,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(company: Company): Prisma.CompanyUncheckedCreateInput {
    return {
      id: company.id.toString(),
      name: company.name,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };
  }
}
