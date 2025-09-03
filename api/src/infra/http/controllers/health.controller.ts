import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/infra/auth/public';

@Controller()
export class HealthController {
  @Get()
  @Public()
  health() {
    return { status: 'alive' };
  }
}
