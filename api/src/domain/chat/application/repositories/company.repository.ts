import { Company } from '@generated/index';
import { Optional } from '@generated/runtime/library';

export type CompanyKey = 'name' | 'id';
export interface CompanyRepositoryFindByUniqueFieldProps {
  key: CompanyKey;
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
  abstract delete(company: Partial<Company>): Promise<void>;
}
