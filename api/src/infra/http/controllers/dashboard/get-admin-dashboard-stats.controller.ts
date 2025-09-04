import {
  Controller,
  Query,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  Get,
} from '@nestjs/common';

import { z } from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe';
import { ResourceNotFoundError } from 'src/domain/chat/application/use-cases/@errors/resource-not-found.error';
import { CurrentUser } from 'src/infra/auth/decorators/current-user.decorator';
import { UserPayload } from 'src/core/types/user-payload';
import { Roles } from 'src/infra/auth/decorators/role.decorator';
import { ApiQuery, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetAdminDashboardStatsUseCase } from 'src/domain/chat/application/use-cases/dashboard/get-admin-dashboard-stats';
import { ForbiddenError } from 'src/domain/chat/application/use-cases/@errors/forbidden.error';

const GetAdminDashboardStatsQuerySchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
});

type GetAdminDashboardStatsQuerySchema = z.infer<
  typeof GetAdminDashboardStatsQuerySchema
>;
const queryValidationPipe = new ZodValidationPipe(
  GetAdminDashboardStatsQuerySchema,
);

@ApiTags('dashboard')
@Controller('/dashboard')
export class GetAdminDashboardStatsController {
  constructor(private getAdminDashboardStats: GetAdminDashboardStatsUseCase) {}

  @Get()
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Get admin dashboard stats',
    description: 'Retorna estatísticas da empresa para administradores.',
  })
  @ApiQuery({
    name: 'from',
    description: 'Data inicial do período (ISO string)',
    required: true,
    example: '2025-09-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'to',
    description: 'Data final do período (ISO string)',
    required: true,
    example: '2025-09-07T23:59:59.999Z',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard stats retrieved successfully',
    schema: {
      example: {
        meta: {
          from: '2025-09-01T00:00:00.000Z',
          to: '2025-09-05T00:00:00.000Z',
        },
        totalUserQuestions: 150,
        totalUsersInPeriod: 12,
        totalUsers: 60,
        topUsers: [
          { userId: 'user1', name: 'John Doe1', questionsCount: 30 },
          { userId: 'user2', name: 'John Doe2', questionsCount: 25 },
        ],
        questionsByDay: [
          { day: '2025-09-01', messages: 20 },
          { day: '2025-09-02', messages: 18 },
        ],
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async handle(
    @Query(queryValidationPipe) query: GetAdminDashboardStatsQuerySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { from, to } = query;

    const result = await this.getAdminDashboardStats.execute({
      from,
      to,
      userId: user.sub,
      companyId: user.companyId,
    });

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case ForbiddenError:
          return new ForbiddenException(error.message);
        case ResourceNotFoundError:
          return new NotFoundException(error.message);
        default:
          return new BadRequestException(error.message);
      }
    }

    return {
      meta: {
        from,
        to,
      },
      ...result.value,
    };
  }
}
