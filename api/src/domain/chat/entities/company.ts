import { Entity } from 'src/core/entities/entity';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Optional } from 'src/core/types/optional';

export type CompanyKey = 'name' | 'id';

export interface CompanyProps {
  name: string;
  createdAt: Date;
  updatedAt?: Date | null;
}

export class Company extends Entity<CompanyProps> {
  get name() {
    return this.props.name;
  }

  set name(name: string) {
    this.props.name = name;
    this.touch();
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<CompanyProps, 'createdAt'>,
    id?: UniqueEntityID,
  ) {
    const company = new Company(
      {
        ...props,
        createdAt: new Date(),
      },
      id,
    );

    return company;
  }
}
