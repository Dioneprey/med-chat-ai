import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { Encrypter } from '../../cryptography/encrypter';
import { ResourceNotFoundError } from '../@errors/resource-not-found.error';
import { UserRepository } from '../../repositories/user.repository';
import { ResourceInvalidError } from '../@errors/resource-invalid.error';
import { ResourceAlreadyExists } from '../@errors/resource-already-exists.error';
import { HashGenerator } from '../../cryptography/hash-generator';
import { CompanyRepository } from '../../repositories/company.repository';

interface RegisterTenantUserUseCaseRequest {
  name: string;
  email: string;
  password: string;
  companyName: string;
}

type RegisterTenantUserUseCaseResponse = Either<
  ResourceNotFoundError | ResourceInvalidError | ResourceAlreadyExists,
  {
    accessToken: string;
  }
>;

@Injectable()
export class RegisterTenantUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private companyRepository: CompanyRepository,
    private encrypter: Encrypter,
    private hashGenerator: HashGenerator,
  ) {}

  async execute({
    email,
    password,
    name,
    companyName,
  }: RegisterTenantUserUseCaseRequest): Promise<RegisterTenantUserUseCaseResponse> {
    const [userWithSameEmailExists, companyWithSameNameExists] =
      await Promise.all([
        this.userRepository.findByUniqueField({
          key: 'email',
          value: email,
        }),
        this.companyRepository.findByUniqueField({
          key: 'name',
          value: companyName,
        }),
      ]);

    if (userWithSameEmailExists) {
      return left(new ResourceAlreadyExists(`User with email: ${email},`));
    }

    if (companyWithSameNameExists) {
      return left(
        new ResourceAlreadyExists(`Company with name: ${companyName},`),
      );
    }

    const hashedPassword = await this.hashGenerator.hash(password);

    const company = await this.companyRepository.create({
      name: companyName,
    });

    const user = await this.userRepository.create({
      email,
      name,
      companyId: company.id,
      role: 'ADMIN',
      password: hashedPassword,
    });

    const accessToken = await this.encrypter.encrypt({
      sub: user.id,
      role: user.role,
      companyId: user.companyId,
    });

    return right({ accessToken });
  }
}
