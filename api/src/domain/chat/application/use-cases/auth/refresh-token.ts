import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { Encrypter } from '../../cryptography/encrypter';
import { UserRepository } from '../../repositories/user.repository';
import { ResourceInvalidError } from '../@errors/resource-invalid.error';
import { CodeRepository } from '../../repositories/code.repository';
import { ResourceNotFoundError } from '../@errors/resource-not-found.error';

interface RefreshTokenUseCaseRequest {
  refreshToken: string;
}

type RefreshTokenUseCaseResponse = Either<
  ResourceNotFoundError | ResourceInvalidError,
  {
    accessToken: string;
    refreshToken: string;
  }
>;

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private userRepository: UserRepository,
    private codeRepository: CodeRepository,
    private encrypter: Encrypter,
  ) {}

  async execute({
    refreshToken,
  }: RefreshTokenUseCaseRequest): Promise<RefreshTokenUseCaseResponse> {
    const tokenRecord = await this.codeRepository.findByUniqueField({
      key: 'value',
      value: refreshToken,
    });

    if (!tokenRecord) {
      return left(new ResourceNotFoundError('Refresh token'));
    }

    if (tokenRecord.expiresAt < new Date()) {
      return left(new ResourceInvalidError('Refresh token'));
    }

    const user = await this.userRepository.findByUniqueField({
      key: 'id',
      value: tokenRecord.userId.toString(),
    });

    if (!user) {
      return left(new ResourceNotFoundError('User'));
    }

    const accessToken = await this.encrypter.encrypt({
      sub: user.id.toString(),
      role: user.role,
      companyId: user.companyId.toString(),
    });

    const newRefreshToken = await this.encrypter.encrypt({
      sub: user.id,
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    tokenRecord.value = newRefreshToken;
    tokenRecord.expiresAt = expiresAt;

    await this.codeRepository.save(tokenRecord);

    return right({ accessToken, refreshToken: newRefreshToken });
  }
}
