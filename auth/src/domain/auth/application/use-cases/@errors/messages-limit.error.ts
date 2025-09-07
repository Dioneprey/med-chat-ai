import { UseCaseError } from 'src/core/errors/use-case-error';

export class MessagesLimitError extends Error implements UseCaseError {
  constructor() {
    super(`Message limit on chat reached, create a new one`);
  }
}
