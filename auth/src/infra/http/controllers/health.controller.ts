import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/infra/auth/public';

@ApiTags('health')
@Controller()
export class HealthController {
  @Get('/health')
  @Public()
  @ApiOperation({
    summary: 'Check API health',
    description: 'Verifica se a API está funcionando corretamente.',
  })
  @ApiResponse({
    status: 200,
    description: 'API está funcionando',
    schema: {
      example: {
        status: 'alive',
      },
    },
  })
  health() {
    return { status: 'alive' };
  }
}
