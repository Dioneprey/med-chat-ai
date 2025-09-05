import {
  CompanyRepository,
  CompanyRepositoryFindByUniqueFieldProps,
} from 'src/domain/chat/application/repositories/company.repository';
import { Company } from 'src/domain/chat/entities/company';

export class InMemoryCompanyRepository implements CompanyRepository {
  public items: Company[] = [];

  async findByUniqueField({
    key,
    value,
  }: CompanyRepositoryFindByUniqueFieldProps): Promise<Company | null> {
    const company = this.items.find((item) => (item as any)[key] === value);
    return company ?? null;
  }

  async create(company: Company): Promise<Company> {
    this.items.push(company);
    return company;
  }

  async save(company: Company): Promise<Company> {
    const index = this.items.findIndex((item) => item.id === company.id);

    this.items[index] = company;

    return company;
  }

  async delete(company: Company): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === company.id);

    this.items.splice(itemIndex, 1);
  }
}
