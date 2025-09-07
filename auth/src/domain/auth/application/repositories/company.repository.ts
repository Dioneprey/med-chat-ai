import { Company, CompanyKey } from '../../entities/company';

export interface CompanyRepositoryFindByUniqueFieldProps {
  key: CompanyKey;
  value: string;
}

export abstract class CompanyRepository {
  abstract findByUniqueField({
    key,
    value,
  }: CompanyRepositoryFindByUniqueFieldProps): Promise<Company | null>;

  abstract create(company: Company): Promise<Company>;
  abstract save(company: Company): Promise<Company>;
  abstract delete(company: Company): Promise<void>;
}
