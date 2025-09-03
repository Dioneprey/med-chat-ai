import { Company } from '@generated/index';
import { Optional } from '@generated/runtime/library';

export interface CompanyRepositoryFindByUniqueFieldProps {
  key: 'name' | 'id';
  value: string;
}

export abstract class CompanyRepository {
  abstract findByUniqueField({
    key,
    value,
  }: CompanyRepositoryFindByUniqueFieldProps): Promise<Company | null>;

  abstract create(
    company: Optional<
      Company,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'role'
      | 'name'
      | 'finishedRegistrationAt'
    >,
  ): Promise<Company>;
  abstract save(company: Partial<Company>): Promise<Company>;
  abstract delete(companyId: string): Promise<void>;
}
