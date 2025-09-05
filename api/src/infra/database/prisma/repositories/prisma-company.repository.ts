import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { Company as PrismaCompany } from '@generated/index';
import {
  CompanyRepository,
  CompanyRepositoryFindByUniqueFieldProps,
} from 'src/domain/chat/application/repositories/company.repository';
import { RedisRepository } from '../../redis/redis.service';
import { PrismaCompanyMapper } from '../mappers/prisma-company-mapper';
import { Company, CompanyKey } from 'src/domain/chat/entities/company';

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
    const cached = await this.redisRepository.get<PrismaCompany>(cacheKey);

    if (cached) return PrismaCompanyMapper.toDomain(cached);

    const prismaCompany = await this.prisma.company.findFirst({
      where: {
        [key]: value,
      },
    });

    if (!prismaCompany) {
      return null;
    }

    await this.redisRepository.set(cacheKey, prismaCompany, 180);

    return PrismaCompanyMapper.toDomain(prismaCompany);
  }

  async create(company: Company) {
    const data = PrismaCompanyMapper.toPrisma(company);

    const createdCompany = await this.prisma.company.create({
      data: data,
    });

    return PrismaCompanyMapper.toDomain(createdCompany);
  }

  async save(company: Company) {
    const data = PrismaCompanyMapper.toPrisma(company);

    const editedCompany = await this.prisma.company.update({
      where: {
        id: data.id,
      },
      data: data,
    });

    for (const key of Object.keys(data) as CompanyKey[]) {
      await this.redisRepository.del(`company:${key}:${data[key]}`);
    }

    return PrismaCompanyMapper.toDomain(editedCompany);
  }

  async delete(company: Company): Promise<void> {
    const data = PrismaCompanyMapper.toPrisma(company);

    await this.prisma.company.delete({
      where: {
        id: data.id,
      },
    });

    for (const key of Object.keys(data) as CompanyKey[]) {
      await this.redisRepository.del(`company:${key}:${data[key]}`);
    }
  }
}
