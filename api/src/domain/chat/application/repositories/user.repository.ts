import { Company, User } from '@generated/index';
import { Optional } from '@generated/runtime/library';

export type UserKey = 'email' | 'id';

export interface UserRepositoryFindByUniqueFieldProps {
  key: 'email' | 'id';
  value: string;
  include?: {
    company?: boolean;
  };
}

export interface UserRepositoryCountProps {
  companyId: string;
  from?: Date;
  to?: Date;
}

interface PrismaUserInclude extends User {
  company?: Company;
}

export abstract class UserRepository {
  abstract findByUniqueField({
    key,
    value,
    include,
  }: UserRepositoryFindByUniqueFieldProps): Promise<PrismaUserInclude | null>;

  abstract count({
    companyId,
    from,
    to,
  }: UserRepositoryCountProps): Promise<number>;

  abstract create(
    user: Optional<User, 'id' | 'createdAt' | 'updatedAt' | 'role'>,
  ): Promise<User>;
  abstract save(user: Partial<User>): Promise<User>;
  abstract delete(user: Partial<User>): Promise<void>;
}
