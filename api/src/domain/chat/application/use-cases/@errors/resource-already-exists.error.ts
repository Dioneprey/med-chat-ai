import { UseCaseError } from 'src/core/errors/use-case-error';

export class ResourceAlreadyExists extends Error implements UseCaseError {
  constructor(identifier: string) {
    super(`${identifier} already exists.`);
  }
}
