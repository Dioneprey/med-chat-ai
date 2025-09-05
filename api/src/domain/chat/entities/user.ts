import { Entity } from 'src/core/entities/entity';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Company } from './company';
import { Optional } from 'src/core/types/optional';

export type UserKey = 'email' | 'id';

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface UserProps {
  name: string;
  email: string;
  password: string;
  companyId: UniqueEntityID;
  role: Role;
  company?: Company;
  createdAt: Date;
  updatedAt?: Date | null;
}

export class User extends Entity<UserProps> {
  get name() {
    return this.props.name;
  }

  set name(name: string) {
    this.props.name = name;
    this.touch();
  }

  get email() {
    return this.props.email;
  }

  set email(email: string) {
    this.props.email = email;
    this.touch();
  }

  get password() {
    return this.props.password;
  }

  set password(password: string) {
    this.props.password = password;
    this.touch();
  }

  get companyId() {
    return this.props.companyId;
  }

  set companyId(companyId: UniqueEntityID) {
    this.props.companyId = companyId;
    this.touch();
  }

  get role() {
    return this.props.role;
  }

  set role(role: Role) {
    this.props.role = role;
    this.touch();
  }

  get company() {
    return this.props.company;
  }

  set company(company: Company | undefined) {
    this.props.company = company;
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

  static create(props: Optional<UserProps, 'createdAt'>, id?: UniqueEntityID) {
    const user = new User(
      {
        ...props,
        createdAt: new Date(),
      },
      id,
    );

    return user;
  }
}
