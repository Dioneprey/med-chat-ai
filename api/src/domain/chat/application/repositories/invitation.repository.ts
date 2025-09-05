import { Invitation, InvitationKey } from '../../entities/invitation';

export interface InvitationRepositoryFindByUniqueFieldProps {
  key: InvitationKey;
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

  abstract create(invitation: Invitation): Promise<Invitation>;

  abstract save(invitation: Invitation): Promise<Invitation>;
  abstract delete(invitation: Invitation): Promise<void>;
}
