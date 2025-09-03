import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { ResourceNotFoundError } from '../@errors/resource-not-found.error';
import { Company } from '@generated/index';
import { CompanyRepository } from '../../repositories/company.repository';

interface GetCompanyByNameUseCaseRequest {
  name: string;
}

type GetCompanyByNameUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    company: Company;
  }
>;

@Injectable()
export class GetCompanyByNameUseCase {
  constructor(private companyRepository: CompanyRepository) {}

  async execute({
    name,
  }: GetCompanyByNameUseCaseRequest): Promise<GetCompanyByNameUseCaseResponse> {
    const companyExists = await this.companyRepository.findByUniqueField({
      key: 'name',
      value: name,
    });

    if (!companyExists) {
      return left(new ResourceNotFoundError(`Company with name: ${name}`));
    }

    return right({ company: companyExists });
  }
}
