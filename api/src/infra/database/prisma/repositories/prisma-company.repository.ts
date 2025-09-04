import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { Company } from '@generated/index';
import {
  CompanyKey,
  CompanyRepository,
  CompanyRepositoryFindByUniqueFieldProps,
} from 'src/domain/chat/application/repositories/company.repository';
import { RedisRepository } from '../../redis/redis.service';

@Injectable()
export class PrismaCompanyRepository implements CompanyRepository {
  constructor(
    private prisma: PrismaService,
    private redisRepository: RedisRepository,
  ) {}
  async findByUniqueField({
    key,
    value,
  }: CompanyRepositoryFindByUniqueFieldProps) {
    const cacheKey = `company:${key}:${value}`;
    const cached = await this.redisRepository.get<Company>(cacheKey);

    if (cached) return cached;

    const company = await this.prisma.company.findFirst({
      where: {
        [key]: value,
      },
    });

    await this.redisRepository.set(cacheKey, company, 180);

    return company;
  }

  async create(company: Company) {
    const createdCompany = await this.prisma.company.create({
      data: {
        ...company,
        createdAt: new Date(),
      },
    });

    return createdCompany;
  }

  async save(company: Company) {
    const editedCompany = await this.prisma.company.update({
      where: {
        id: company.id,
      },
      data: company,
    });

    for (const key of Object.keys(company) as CompanyKey[]) {
      await this.redisRepository.del(`company:${key}:${company[key]}`);
    }

    return editedCompany;
  }

  async delete(company: Company): Promise<void> {
    await this.prisma.company.delete({
      where: {
        id: company.id,
      },
    });

    for (const key of Object.keys(company) as CompanyKey[]) {
      await this.redisRepository.del(`company:${key}:${company[key]}`);
    }
  }
}
