import { Controller, Get } from '@nestjs/common';

import { CurrentUser } from 'src/infra/auth/decorators/current-user.decorator';
import { UserPayload } from 'src/core/types/user-payload';

@Controller('/user')
export class GetMeController {
  constructor() {}

  @Get()
  async handle(@CurrentUser() user: UserPayload) {
    return user;
  }
}
