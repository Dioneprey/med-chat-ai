import { InMemoryUserRepository } from 'test/repositories/in-memory-user.repository';
import { makeUser } from 'test/factories/make-user';
import { RegisterTenantUserUseCase } from './register-tenant-user';
import { InMemoryCompanyRepository } from 'test/repositories/in-memory-company.repository';
import { InMemoryCodeRepository } from 'test/repositories/in-memory-code.repository';
import { FakeEncrypter } from 'test/cryptography/fake-encrypter';
import { FakeHasher } from 'test/cryptography/fake-hasher';
import { ResourceAlreadyExists } from '../@errors/resource-already-exists.error';

let inMemoryUserRepository: InMemoryUserRepository;
let inMemoryCompanyRepository: InMemoryCompanyRepository;
let inMemoryCodeRepository: InMemoryCodeRepository;
let fakeEncrypter: FakeEncrypter;
let fakeHasher: FakeHasher;

let sut: RegisterTenantUserUseCase;

describe('Register tenant user', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository();
    inMemoryCompanyRepository = new InMemoryCompanyRepository();
    inMemoryCodeRepository = new InMemoryCodeRepository();
    fakeEncrypter = new FakeEncrypter();
    fakeHasher = new FakeHasher();

    sut = new RegisterTenantUserUseCase(
      inMemoryUserRepository,
      inMemoryCompanyRepository,
      inMemoryCodeRepository,
      fakeEncrypter,
      fakeHasher,
    );
  });

  it('should be able to register a tenant user', async () => {
    const result = await sut.execute({
      email: 'admin@email.com',
      password: '123456',
      companyName: 'Empresa',
      name: 'Admin',
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

  it('should not be able to register with email already used', async () => {
    const email = 'used.email@email.com';

    await inMemoryUserRepository.create(
      makeUser({
        email,
      }),
    );

    const result = await sut.execute({
      email: email,
      password: '123456',
      companyName: 'Empresa',
      name: 'Admin',
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceAlreadyExists);
  });
});
