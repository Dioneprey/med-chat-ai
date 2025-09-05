import { InMemoryUserRepository } from 'test/repositories/in-memory-user.repository';
import { InMemoryCodeRepository } from 'test/repositories/in-memory-code.repository';
import { FakeEncrypter } from 'test/cryptography/fake-encrypter';
import { FakeHasher } from 'test/cryptography/fake-hasher';
import { RegisterUserUseCase } from './register-user';
import { InMemoryInvitationRepository } from 'test/repositories/in-memory-invitation.repository';
import { makeInvitation } from 'test/factories/make-invitation';
import { ResourceNotFoundError } from '../@errors/resource-not-found.error';

let inMemoryUserRepository: InMemoryUserRepository;
let inMemoryInvitationRepository: InMemoryInvitationRepository;
let inMemoryCodeRepository: InMemoryCodeRepository;
let fakeEncrypter: FakeEncrypter;
let fakeHasher: FakeHasher;

let sut: RegisterUserUseCase;

describe('Register user', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository();
    inMemoryInvitationRepository = new InMemoryInvitationRepository();
    inMemoryCodeRepository = new InMemoryCodeRepository();
    fakeEncrypter = new FakeEncrypter();
    fakeHasher = new FakeHasher();

    sut = new RegisterUserUseCase(
      inMemoryUserRepository,
      inMemoryInvitationRepository,
      inMemoryCodeRepository,
      fakeEncrypter,
      fakeHasher,
    );
  });

  it('should be able to register user with invitation valid', async () => {
    const invitationCode = '123456';
    const invitedEmail = 'user@email.com';

    await inMemoryInvitationRepository.create(
      makeInvitation({
        invitedEmail,
        code: invitationCode,
      }),
    );

    const result = await sut.execute({
      email: invitedEmail,
      password: '123456',
      name: 'User',
      invitationCode,
    });

    if (result.isLeft()) {
      throw new Error(`Use case failed: ${JSON.stringify(result.value)}`);
    }

    expect(result.isRight()).toBeTruthy();
    expect(result.value).toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });
  });

  it('should not be able to register with invalid invitation', async () => {
    const result = await sut.execute({
      email: 'user@email.com',
      password: '123456',
      invitationCode: 'Invalid code',
      name: 'User',
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
