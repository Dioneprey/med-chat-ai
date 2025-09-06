import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { Encrypter } from '../../cryptography/encrypter';
import { UserRepository } from '../../repositories/user.repository';
import { ResourceAlreadyExists } from '../@errors/resource-already-exists.error';
import { HashGenerator } from '../../cryptography/hash-generator';
import { CompanyRepository } from '../../repositories/company.repository';
import { CodeRepository } from '../../repositories/code.repository';
import { Role, User } from 'src/domain/chat/entities/user';
import { Code, CodeType } from 'src/domain/chat/entities/code';
import { Company } from 'src/domain/chat/entities/company';

interface RegisterTenantUserUseCaseRequest {
  name: string;
  email: string;
  password: string;
  companyName: string;
}

type RegisterTenantUserUseCaseResponse = Either<
  ResourceAlreadyExists,
  {
    accessToken: string;
    refreshToken: string;
  }
>;

@Injectable()
export class RegisterTenantUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private companyRepository: CompanyRepository,
    private codeRepository: CodeRepository,
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

    const company = Company.create({
      name: companyName,
    });

    await this.companyRepository.create(company);

    const user = User.create({
      email,
      name,
      companyId: company.id,
      role: Role.ADMIN,
      password: hashedPassword,
    });

    await this.userRepository.create(user);

    const accessToken = await this.encrypter.encrypt({
      sub: user.id.toString(),
      role: user.role,
      companyId: user.companyId.toString(),
    });

    const refreshToken = await this.encrypter.encrypt({
      sub: user.id.toString(),
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const code = Code.create({
      userId: user.id,
      value: refreshToken,
      type: CodeType.REFRESH_TOKEN,
      expiresAt: expiresAt,
    });

    await this.codeRepository.create(code);

    return right({ accessToken, refreshToken });
  }
}
