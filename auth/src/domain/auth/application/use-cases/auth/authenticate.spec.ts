import { expect } from 'vitest';
import { AuthenticateUseCase } from './authenticate';
import { FakeHasher } from 'test/cryptography/fake-hasher';
import { FakeEncrypter } from 'test/cryptography/fake-encrypter';
import { InMemoryUserRepository } from 'test/repositories/in-memory-user.repository';
import { InMemoryCodeRepository } from 'test/repositories/in-memory-code.repository';
import { makeUser } from 'test/factories/make-user';
import { WrongCredentialsError } from '../@errors/wrong-credentials';

let inMemoryUserRepository: InMemoryUserRepository;
let inMemoryCodeRepository: InMemoryCodeRepository;
let fakeEncrypter: FakeEncrypter;
let fakeHasher: FakeHasher;

let sut: AuthenticateUseCase;

describe('Authenticate', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository();
    inMemoryCodeRepository = new InMemoryCodeRepository();
    fakeEncrypter = new FakeEncrypter();
    fakeHasher = new FakeHasher();

    sut = new AuthenticateUseCase(
      inMemoryUserRepository,
      inMemoryCodeRepository,
      fakeEncrypter,
      fakeHasher,
    );
  });

  it('should be able to authenticate', async () => {
    const user = makeUser({
      email: 'john.doe@email.com',
      password: await fakeHasher.hash('123456'),
    });

    inMemoryUserRepository.items.push(user);

    const result = await sut.execute({
      email: 'john.doe@email.com',
      password: '123456',
    });

    expect(result.isRight()).toBeTruthy();
    expect(result.value).toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });
  });

  it('should not be able to authenticate with wrong credentials', async () => {
    const user = makeUser({
      email: 'john.doe@email.com',
      password: await fakeHasher.hash('123456'),
    });

    inMemoryUserRepository.create(user);

    const result = await sut.execute({
      email: 'john.doe@email.com',
      password: 'wrong-password',
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(WrongCredentialsError);
  });
});
