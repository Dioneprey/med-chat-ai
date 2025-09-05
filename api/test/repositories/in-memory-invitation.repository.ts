import {
  InvitationRepository,
  InvitationRepositoryFindByUniqueFieldProps,
} from 'src/domain/chat/application/repositories/invitation.repository';
import { Invitation } from 'src/domain/chat/entities/invitation';

export class InMemoryInvitationRepository implements InvitationRepository {
  public items: Invitation[] = [];

  async findByUniqueField({
    key,
    value,
  }: InvitationRepositoryFindByUniqueFieldProps): Promise<Invitation | null> {
    const invitation = this.items.find((item) => (item as any)[key] === value);
    return invitation ?? null;
  }

  async create(invitation: Invitation): Promise<Invitation> {
    this.items.push(invitation);
    return invitation;
  }

  async save(invitation: Invitation): Promise<Invitation> {
    const index = this.items.findIndex((item) => item.id === invitation.id);

    this.items[index] = invitation;

    return invitation;
  }

  async delete(invitation: Invitation): Promise<void> {
    const index = this.items.findIndex((item) => item.id === invitation.id);

    this.items.splice(index, 1);
  }
}
