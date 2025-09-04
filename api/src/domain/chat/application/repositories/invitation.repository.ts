import { Invitation } from '@generated/index';
import { Optional } from '@generated/runtime/library';

export interface InvitationRepositoryFindByUniqueFieldProps {
  key: 'code' | 'id' | 'invitedEmail';
  value: string;
  include?: {
    user?: boolean;
    company?: boolean;
  };
}

export abstract class InvitationRepository {
  abstract findByUniqueField({
    key,
    value,
    include,
  }: InvitationRepositoryFindByUniqueFieldProps): Promise<Invitation | null>;

  abstract create(
    invitation: Optional<Invitation, 'id' | 'createdAt' | 'updatedAt' | 'used'>,
  ): Promise<Invitation>;

  abstract save(invitation: Partial<Invitation>): Promise<Invitation>;
  abstract delete(invitation: Partial<Invitation>): Promise<void>;
}
