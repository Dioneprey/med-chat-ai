import {
  UserRepository,
  UserRepositoryCountProps,
  UserRepositoryFindByUniqueFieldProps,
} from 'src/domain/chat/application/repositories/user.repository';
import { User } from 'src/domain/chat/entities/user';

export class InMemoryUserRepository implements UserRepository {
  public items: User[] = [];

  async findByUniqueField({
    key,
    value,
  }: UserRepositoryFindByUniqueFieldProps): Promise<User | null> {
    const user = this.items.find((item) => {
      const fieldValue = (item as any)[key];
      return String(fieldValue) === String(value);
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async count({
    companyId,
    from,
    to,
  }: UserRepositoryCountProps): Promise<number> {
    return this.items.filter((item) => {
      if (item.companyId.toString() !== companyId) return false;

      if (from && item.createdAt < from) return false;
      if (to && item.createdAt > to) return false;

      return true;
    }).length;
  }

  async save(user: User): Promise<User> {
    const index = this.items.findIndex((item) => item.id === user.id);

    this.items[index] = user;

    return user;
  }

  async delete(user: User): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === user.id);

    this.items.splice(itemIndex, 1);
  }

  async create(user: User) {
    this.items.push(user);

    return user;
  }
}
