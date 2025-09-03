import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { Company } from '@generated/index';
import {
  CompanyRepository,
  CompanyRepositoryFindByUniqueFieldProps,
} from 'src/domain/qa/application/repositories/company.repository';

@Injectable()
export class PrismaCompanyRepository implements CompanyRepository {
  constructor(private prisma: PrismaService) {}
  async findByUniqueField({
    key,
    value,
  }: CompanyRepositoryFindByUniqueFieldProps) {
    if (!value) return null;

    return await this.prisma.company.findFirst({
      where: {
        [key]: value,
      },
    });
  }

  async create(company: Company) {
    return await this.prisma.company.create({
      data: {
        ...company,
        createdAt: new Date(),
      },
    });
  }

  async save(company: Company) {
    return await this.prisma.company.update({
      where: {
        id: company.id,
      },
      data: company,
    });
  }

  async delete(companyId: string): Promise<void> {
    await this.prisma.company.delete({
      where: {
        id: companyId,
      },
    });
  }
}
