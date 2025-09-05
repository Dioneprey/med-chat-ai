import { expect } from 'vitest';
import { GetCompanyByNameUseCase } from './get-company-by-name';
import { InMemoryCompanyRepository } from 'test/repositories/in-memory-company.repository';
import { makeCompany } from 'test/factories/make-company';

let inMemoryCompanyRepository: InMemoryCompanyRepository;

let sut: GetCompanyByNameUseCase;

describe('Fetch all chats', () => {
  beforeEach(() => {
    inMemoryCompanyRepository = new InMemoryCompanyRepository();

    sut = new GetCompanyByNameUseCase(inMemoryCompanyRepository);
  });

  it('should be able to get a company by name', async () => {
    const company = makeCompany({});

    inMemoryCompanyRepository.create(company);

    const result = await sut.execute({
      name: company.name,
    });

    if (result.isLeft()) {
      throw new Error('Failed');
    }

    expect(result.value.company.name).toEqual(company.name);
  });
});
