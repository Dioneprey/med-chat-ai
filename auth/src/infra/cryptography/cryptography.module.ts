import { Module } from '@nestjs/common';
import { Encrypter } from 'src/domain/auth/application/cryptography/encrypter';
import { JwtEncrypter } from './jwt-encrypter';
import { EnvModule } from 'src/infra/env/env.module';
import { HashComparer } from 'src/domain/auth/application/cryptography/hash-comparer';
import { BcryptHasher } from './bcrypt.hasher';
import { HashGenerator } from 'src/domain/auth/application/cryptography/hash-generator';

@Module({
  imports: [EnvModule],
  providers: [
    { provide: Encrypter, useClass: JwtEncrypter },
    { provide: HashComparer, useClass: BcryptHasher },
    { provide: HashGenerator, useClass: BcryptHasher },
  ],
  exports: [Encrypter, HashComparer, HashGenerator],
})
export class CryptographyModule {}
