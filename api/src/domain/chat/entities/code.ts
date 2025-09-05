import { Entity } from 'src/core/entities/entity';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Optional } from 'src/core/types/optional';

export enum CodeType {
  REFRESH_TOKEN = 'REFRESH_TOKEN',
}

export interface CodeProps {
  userId: UniqueEntityID;
  value: string;
  type: CodeType;
  expiresAt: Date;
  createdAt: Date;
}

export class Code extends Entity<CodeProps> {
  get userId() {
    return this.props.userId;
  }

  set userId(userId: UniqueEntityID) {
    this.props.userId = userId;
  }

  get value() {
    return this.props.value;
  }

  set value(value: string) {
    this.props.value = value;
  }

  get type() {
    return this.props.type;
  }

  set type(type: CodeType) {
    this.props.type = type;
  }

  get expiresAt() {
    return this.props.expiresAt;
  }

  set expiresAt(expiresAt: Date) {
    this.props.expiresAt = expiresAt;
  }

  get createdAt() {
    return this.props.createdAt;
  }
  static create(props: Optional<CodeProps, 'createdAt'>, id?: UniqueEntityID) {
    const code = new Code(
      {
        ...props,
        createdAt: new Date(),
      },
      id,
    );

    return code;
  }
}
