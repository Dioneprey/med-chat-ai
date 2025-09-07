import { Entity } from 'src/core/entities/entity';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Optional } from 'src/core/types/optional';

export type InvitationKey = 'code' | 'id' | 'invitedEmail';

export interface InvitationProps {
  companyId: UniqueEntityID;
  invitedEmail: string;
  code: string;
  createdAt: Date;
  expiresAt: Date;
}

export class Invitation extends Entity<InvitationProps> {
  get companyId() {
    return this.props.companyId;
  }

  set companyId(companyId: UniqueEntityID) {
    this.props.companyId = companyId;
  }

  get invitedEmail() {
    return this.props.invitedEmail;
  }

  set invitedEmail(invitedEmail: string) {
    this.props.invitedEmail = invitedEmail;
  }

  get code() {
    return this.props.code;
  }

  set code(code: string) {
    this.props.code = code;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get expiresAt() {
    return this.props.expiresAt;
  }

  set expiresAt(expiresAt: Date) {
    this.props.expiresAt = expiresAt;
  }

  static create(
    props: Optional<InvitationProps, 'createdAt'>,
    id?: UniqueEntityID,
  ) {
    const invitation = new Invitation(
      {
        ...props,
        createdAt: props.createdAt || new Date(),
      },
      id,
    );

    return invitation;
  }
}
