import { Company, User } from '@generated/index';
import { Optional } from '@generated/runtime/library';

export interface UserRepositoryFindByUniqueFieldProps {
  key: 'email' | 'id';
  value: string;
  include?: {
    company?: boolean;
  };
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

  abstract create(
    user: Optional<User, 'id' | 'createdAt' | 'updatedAt' | 'role'>,
  ): Promise<User>;
  abstract save(user: Partial<User>): Promise<User>;
  abstract delete(userId: string): Promise<void>;
}
