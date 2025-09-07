import { Injectable, Logger } from '@nestjs/common';
import { KafkaClient } from '../kafka-client.service';
import { User } from 'src/domain/auth/entities/user';
import { UserCreatedMessage } from 'src/core/types/messages/user-created-message';

@Injectable()
export class UserCreatedProducer {
  private readonly logger = new Logger(UserCreatedProducer.name);

  constructor(private readonly kafkaClient: KafkaClient) {}

  async emit(user: User) {
    const userMessage: UserCreatedMessage = {
      id: user.id.toString(),
      name: user.name,
      companyId: user.companyId.toString(),
      role: user.role,
    };

    await this.kafkaClient.sendMessage(
      'user.created',
      user.id.toString(),
      userMessage,
    );

    this.logger.log(
      `Send user.created event message for userId: ${user.id.toString()}`,
    );
  }
}
