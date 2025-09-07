import { InMemoryUserRepository } from 'test/repositories/in-memory-user.repository';
import { makeUser } from 'test/factories/make-user';
import { Role } from 'src/domain/auth/entities/user';
import { makeCompany } from 'test/factories/make-company';
import { InMemoryInvitationRepository } from 'test/repositories/in-memory-invitation.repository';
import { RevokeInvitationUseCase } from './revoke-invitation';
import { makeInvitation } from 'test/factories/make-invitation';

let inMemoryInvitationRepository: InMemoryInvitationRepository;
let inMemoryUserRepository: InMemoryUserRepository;

let sut: RevokeInvitationUseCase;

describe('Revoke invitation', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository();
    inMemoryInvitationRepository = new InMemoryInvitationRepository();

    sut = new RevokeInvitationUseCase(
      inMemoryUserRepository,
      inMemoryInvitationRepository,
    );
  });

  it('should be able to revoke an invitation', async () => {
    const company = makeCompany();
    const adminUser = makeUser({
      role: Role.ADMIN,
      companyId: company.id,
      company,
    });

    await inMemoryUserRepository.create(adminUser);

    const invitedEmail = 'newuser@email.com';

    await inMemoryInvitationRepository.create(
      makeInvitation({
        invitedEmail,
      }),
    );
    const invitaation = inMemoryInvitationRepository.items.find(
      (i) => i.invitedEmail === invitedEmail,
    );

    const result = await sut.execute({
      userId: adminUser.id.toString(),
      invitedEmail,
    });

    if (result.isLeft()) {
      throw new Error(`Use case failed: ${JSON.stringify(result.value)}`);
    }

    const invitation = inMemoryInvitationRepository.items.find(
      (i) => i.invitedEmail === invitedEmail,
    );

    expect(invitation).toEqual(undefined);
  });
});
