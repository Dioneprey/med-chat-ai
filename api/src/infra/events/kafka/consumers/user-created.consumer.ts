import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EachMessagePayload } from 'kafkajs';
import { KafkaClient } from '../kafka-client.service';
import { UserRepository } from 'src/domain/chat/application/repositories/user.repository';
import { UserCreatedMessage } from 'src/core/types/messages/user-created-message';
import { Role, User } from 'src/domain/chat/entities/user';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';

@Injectable()
export class UserCreatedConsumer implements OnModuleInit {
  private readonly logger = new Logger(UserCreatedConsumer.name);

  private consumer;

  constructor(
    private readonly kafkaClient: KafkaClient,
    private readonly userRepository: UserRepository,
  ) {
    this.consumer = this.kafkaClient.createConsumer('chat-service-users');
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: 'user.created',
      fromBeginning: true,
    });

    await this.consumer.run({
      eachMessage: async ({ message }: EachMessagePayload) => {
        if (!message.value) return;

        let payload: UserCreatedMessage;
        try {
          payload = JSON.parse(message.value.toString()) as UserCreatedMessage;
        } catch (err) {
          console.error('Failed to parse user-created message', err);
          return;
        }

        this.logger.log(
          `Received user.created event message for userId: $'{payload.id.toString()'}`,
        );

        const role = Object.values(Role).includes(payload.role as Role)
          ? (payload.role as Role)
          : Role.USER;

        const user = User.create(
          {
            name: payload.name,
            companyId: new UniqueEntityID(payload.companyId),
            role: role,
          },
          new UniqueEntityID(payload.id),
        );

        await this.userRepository.create(user);
      },
    });
  }
}
