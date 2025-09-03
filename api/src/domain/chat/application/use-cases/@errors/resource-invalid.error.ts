import { UseCaseError } from 'src/core/errors/use-case-error';

export class ResourceInvalidError extends Error implements UseCaseError {
  constructor(identifier: string) {
    super(`${identifier} is invalid.`);
  }
}
