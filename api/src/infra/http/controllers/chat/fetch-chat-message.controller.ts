import {
  Controller,
  HttpCode,
  BadRequestException,
  NotFoundException,
  Param,
  Get,
  Query,
  ConflictException,
} from '@nestjs/common';

import { z } from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/infra/auth/decorators/current-user.decorator';
import { UserPayload } from 'src/core/types/user-payload';
import { ResourceNotFoundError } from 'src/domain/chat/application/use-cases/@errors/resource-not-found.error';
import { FetchChatMessageUseCase } from 'src/domain/chat/application/use-cases/chat/fetch-chat-messages';
import { MessagesLimitError } from 'src/domain/chat/application/use-cases/@errors/messages-limit.error';
import { MessagePresenter } from '../../presenters/message-presenter';

const fetchChatMessageParamSchema = z.object({
  chatId: z.string(),
});

type FetchChatMessageParamSchema = z.infer<typeof fetchChatMessageParamSchema>;
const paramsValidationPipe = new ZodValidationPipe(fetchChatMessageParamSchema);

const fetchChatMessageQuerySchema = z.object({
  pageIndex: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(20).default(20),
});
type FetchChatMessageQuerySchema = z.infer<typeof fetchChatMessageQuerySchema>;
const queryValidationPipe = new ZodValidationPipe(fetchChatMessageQuerySchema);

@ApiTags('chat')
@Controller('/chat/:chatId/message')
export class FetchChatMessageController {
  constructor(private fetchChatMessage: FetchChatMessageUseCase) {}

  @Get()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Fetch messages from a chat',
    description:
      'Retorna uma lista paginada de mensagens de um chat específico',
  })
  @ApiParam({
    name: 'chatId',
    description: 'ID do chat',
    required: true,
    schema: { type: 'string', example: 'abc123' },
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
    description: 'Lista de mensagens retornada com sucesso',
    schema: {
      example: {
        chatId: 'abc123',
        messages: [
          {
            id: '1',
            content: 'Olá!',
            senderId: 'user1',
            createdAt: '2025-09-04T12:00:00Z',
          },
        ],
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
    status: 404,
    description: 'Chat não encontrado',
    schema: { example: { message: 'Chat não encontrado' } },
  })
  @ApiResponse({
    status: 409,
    description: 'Limite de mensagens excedido',
    schema: { example: { message: 'Limite de mensagens excedido' } },
  })
  @ApiResponse({
    status: 400,
    description: 'Requisição inválida',
    schema: { example: { message: 'Erro de requisição' } },
  })
  async handle(
    @Param(paramsValidationPipe) params: FetchChatMessageParamSchema,
    @Query(queryValidationPipe) query: FetchChatMessageQuerySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { chatId } = params;
    const { pageIndex, pageSize } = query;

    const result = await this.fetchChatMessage.execute({
      userId: user.sub,
      chatId,
      companyId: user.companyId,
      pageIndex,
      pageSize,
    });

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case ResourceNotFoundError:
          return new NotFoundException(error.message);
        case MessagesLimitError:
          return new ConflictException(error.message);
        default:
          return new BadRequestException(error.message);
      }
    }

    const { messages, totalCount, totalPages } = result.value;

    return {
      chatId,
      messages: messages.map(MessagePresenter.toHTTP),
      meta: {
        pageIndex: pageIndex ?? 0,
        pageSize,
        totalCount,
        totalPages,
      },
    };
  }
}
