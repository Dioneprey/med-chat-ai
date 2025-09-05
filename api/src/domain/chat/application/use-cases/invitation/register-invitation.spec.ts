import { InMemoryUserRepository } from 'test/repositories/in-memory-user.repository';
import { makeUser } from 'test/factories/make-user';
import { Role } from 'src/domain/chat/entities/user';
import { makeCompany } from 'test/factories/make-company';
import { RegisterInvitationUseCase } from './register-invitation';
import { InMemoryInvitationRepository } from 'test/repositories/in-memory-invitation.repository';
import { FakeSendEmailSchedule } from 'test/schedule/fake-send-email.schedule';
import { EmailTemplate } from 'src/core/types/email-template';

let inMemoryInvitationRepository: InMemoryInvitationRepository;
let inMemoryUserRepository: InMemoryUserRepository;
let fakeSendEmailSchedule: FakeSendEmailSchedule;

let sut: RegisterInvitationUseCase;

describe('Register invitation', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository();
    inMemoryInvitationRepository = new InMemoryInvitationRepository();
    fakeSendEmailSchedule = new FakeSendEmailSchedule();

    sut = new RegisterInvitationUseCase(
      inMemoryUserRepository,
      inMemoryInvitationRepository,
      fakeSendEmailSchedule,
    );
  });

  it('should be able to send an invitation', async () => {
    const company = makeCompany();
    const adminUser = makeUser({
      role: Role.ADMIN,
      companyId: company.id,
      company,
    });

    await inMemoryUserRepository.create(adminUser);

    const invitedEmail = 'newuser@email.com';

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

    expect(fakeSendEmailSchedule.jobs).toHaveLength(1);
    expect(fakeSendEmailSchedule.jobs[0].data).toEqual(
      expect.objectContaining({
        recipientEmail: invitedEmail,
        template: EmailTemplate.INVITATION,
        variables: expect.objectContaining({
          invitationCode: invitation?.code,
          companyName: company.name,
        }),
        subject: `Convite para se juntar à ${company.name}!`,
      }),
    );
  });
});
