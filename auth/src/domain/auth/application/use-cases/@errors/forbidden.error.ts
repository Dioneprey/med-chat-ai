import { UseCaseError } from 'src/core/errors/use-case-error';

export class ForbiddenError extends Error implements UseCaseError {
  constructor() {
    super(`Forbidden.`);
  }
}
