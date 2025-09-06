import { expect } from 'vitest';
import { FakeEncrypter } from 'test/cryptography/fake-encrypter';
import { InMemoryUserRepository } from 'test/repositories/in-memory-user.repository';
import { InMemoryCodeRepository } from 'test/repositories/in-memory-code.repository';
import { makeUser } from 'test/factories/make-user';
import { RefreshTokenUseCase } from './refresh-token';
import { makeCode } from 'test/factories/make-code';
import { ResourceNotFoundError } from '../@errors/resource-not-found.error';

let inMemoryUserRepository: InMemoryUserRepository;
let inMemoryCodeRepository: InMemoryCodeRepository;
let fakeEncrypter: FakeEncrypter;

let sut: RefreshTokenUseCase;

describe('Refresh token', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository();
    inMemoryCodeRepository = new InMemoryCodeRepository();
    fakeEncrypter = new FakeEncrypter();

    sut = new RefreshTokenUseCase(
      inMemoryUserRepository,
      inMemoryCodeRepository,
      fakeEncrypter,
    );
  });

  it('should be able to refresh token', async () => {
    const user = makeUser({
      email: 'john.doe@email.com',
    });

    const code = makeCode({
      userId: user.id,
    });

    inMemoryUserRepository.create(user);
    inMemoryCodeRepository.create(code);

    const result = await sut.execute({
      refreshToken: code.value,
    });

    expect(result.isRight()).toBeTruthy();
    expect(result.value).toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });
  });

  it('should not be able to refresh invalid token', async () => {
    const user = makeUser({
      email: 'john.doe@email.com',
    });

    inMemoryUserRepository.create(user);

    const result = await sut.execute({
      refreshToken: 'invalid-token',
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
