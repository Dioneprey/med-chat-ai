import {
  Controller,
  HttpCode,
  BadRequestException,
  Get,
  Query,
} from '@nestjs/common';

import { z } from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/infra/auth/decorators/current-user.decorator';
import { UserPayload } from 'src/core/types/user-payload';
import { FetchAllChatsUseCaseUseCase } from 'src/domain/chat/application/use-cases/chat/fetch-all-chats';

const fetchAllChatsQuerySchema = z.object({
  pageIndex: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(20).default(20),
});
type FetchAllChatsQuerySchema = z.infer<typeof fetchAllChatsQuerySchema>;
const queryValidationPipe = new ZodValidationPipe(fetchAllChatsQuerySchema);

@ApiTags('chat')
@Controller('/chat')
export class FetchAllChatsController {
  constructor(private fetchAllChats: FetchAllChatsUseCaseUseCase) {}

  @Get()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Fetch all chats',
    description: 'Retorna uma lista paginada de chats do usuário',
  })
  @ApiQuery({
    name: 'pageIndex',
    required: false,
    description: 'Número da página (padrão: 1)',
    schema: { type: 'number', default: 1 },
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: 'Quantidade de itens por página (máx: 20, padrão: 20)',
    schema: { type: 'number', default: 20 },
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de chats retornada com sucesso',
    schema: {
      example: {
        chats: [{ id: '1', title: 'Chat 1', lastMessage: 'Olá!' }],
        meta: {
          pageIndex: 1,
          pageSize: 20,
          totalCount: 50,
          totalPages: 3,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Requisição inválida',
    schema: { example: { message: 'Erro de requisição' } },
  })
  async handle(
    @Query(queryValidationPipe) query: FetchAllChatsQuerySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { pageIndex, pageSize } = query;

    const result = await this.fetchAllChats.execute({
      userId: user.sub,
      companyId: user.companyId,
      pageIndex,
      pageSize,
    });

    if (result.isLeft()) {
      return new BadRequestException();
    }

    const { chats, totalCount, totalPages } = result.value;

    return {
      chats,
      meta: {
        pageIndex: pageIndex ?? 0,
        pageSize,
        totalCount,
        totalPages,
      },
    };
  }
}
