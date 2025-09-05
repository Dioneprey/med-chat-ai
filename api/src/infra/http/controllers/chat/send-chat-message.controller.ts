import {
  Controller,
  Post,
  Body,
  HttpCode,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { z } from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SendChatMessageUseCase } from 'src/domain/chat/application/use-cases/chat/send-chat-message';
import { CurrentUser } from 'src/infra/auth/decorators/current-user.decorator';
import { UserPayload } from 'src/core/types/user-payload';
import { ResourceNotFoundError } from 'src/domain/chat/application/use-cases/@errors/resource-not-found.error';
import { MessagePresenter } from '../../presenters/message-presenter';

const sendChatMessageBodySchema = z.object({
  message: z.string(),
  chatId: z.string().optional(),
});

type SendChatMessageBodySchema = z.infer<typeof sendChatMessageBodySchema>;
const bodyValidationPipe = new ZodValidationPipe(sendChatMessageBodySchema);

@ApiTags('chat')
@Controller('/chat/message')
export class SendChatMessageController {
  constructor(private sendChatMessage: SendChatMessageUseCase) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Send a message to a chat',
    description:
      'Envia uma mensagem para um chat existente ou cria um novo chat se chatId não for informado',
  })
  @ApiBody({
    description: 'Mensagem a ser enviada e opcionalmente o chatId',
    schema: {
      example: {
        chatId: 'abc123',
        message: 'Olá, tudo bem?',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Mensagem enviada com sucesso',
    schema: {
      example: {
        id: 'msg123',
        chatId: 'abc123',
        message: 'Olá, tudo bem?',
        senderId: 'user1',
        createdAt: '2025-09-04T12:00:00Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Chat não encontrado',
    schema: { example: { message: 'Chat não encontrado' } },
  })
  @ApiResponse({
    status: 400,
    description: 'Requisição inválida',
    schema: { example: { message: 'Erro de requisição' } },
  })
  async handle(
    @Body(bodyValidationPipe) body: SendChatMessageBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { chatId, message } = body;

    const result = await this.sendChatMessage.execute({
      userId: user.sub,
      chatId,
      companyId: user.companyId,
      message,
    });

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case ResourceNotFoundError:
          return new NotFoundException(error.message);
        default:
          return new BadRequestException(error.message);
      }
    }

    const { message: messageResponse } = result.value;

    return {
      message: MessagePresenter.toHTTP(messageResponse),
    };
  }
}
