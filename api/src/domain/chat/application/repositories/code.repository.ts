import { Code, CodeType } from '@generated/index';
import { Optional } from '@generated/runtime/library';

export interface CodeRepositoryFindByUniqueFieldProps {
  key: 'value' | 'id';
  value: string;
}

export interface CodeRepositoryDeleteByUserIdProps {
  userId: string;
  type: CodeType;
}

export abstract class CodeRepository {
  abstract findByUniqueField({
    key,
    value,
  }: CodeRepositoryFindByUniqueFieldProps): Promise<Code | null>;

  abstract create(
    code: Optional<Code, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Code>;
  abstract save(code: Partial<Code>): Promise<Code>;
  abstract deleteByUserId({
    userId,
    type,
  }: CodeRepositoryDeleteByUserIdProps): Promise<void>;
}
