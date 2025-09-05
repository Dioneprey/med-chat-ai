import {
  CodeRepository,
  CodeRepositoryDeleteByUserIdProps,
  CodeRepositoryFindByUniqueFieldProps,
} from 'src/domain/chat/application/repositories/code.repository';
import { Code } from 'src/domain/chat/entities/code';

export class InMemoryCodeRepository implements CodeRepository {
  public items: Code[] = [];

  async findByUniqueField({
    key,
    value,
  }: CodeRepositoryFindByUniqueFieldProps): Promise<Code | null> {
    const code = this.items.find((item) => {
      const fieldValue = (item as any)[key];
      return String(fieldValue) === String(value);
    });

    if (!code) {
      return null;
    }

    return code;
  }

  async create(code: Code): Promise<Code> {
    this.items.push(code);

    return code;
  }

  async save(code: Code): Promise<Code> {
    const index = this.items.findIndex((item) => item.id === code.id);

    this.items[index] = code;

    return code;
  }

  async deleteByUserId({
    userId,
    type,
  }: CodeRepositoryDeleteByUserIdProps): Promise<void> {
    this.items = this.items.filter(
      (item) => !(item.userId.toString() === userId && item.type === type),
    );
  }
}
