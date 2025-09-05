import { User, UserKey } from '../../entities/user';

export interface UserRepositoryFindByUniqueFieldProps {
  key: UserKey;
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

export abstract class UserRepository {
  abstract findByUniqueField({
    key,
    value,
    include,
  }: UserRepositoryFindByUniqueFieldProps): Promise<User | null>;

  abstract count({
    companyId,
    from,
    to,
  }: UserRepositoryCountProps): Promise<number>;

  abstract create(user: User): Promise<User>;
  abstract save(user: User): Promise<User>;
  abstract delete(user: User): Promise<void>;
}
