import { Module } from '@nestjs/common';
import { KafkaClient } from './kafka/kafka-client.service';
import { EnvModule } from '../env/env.module';
import { UserCreatedProducer } from './kafka/producers/user-created.producer';

@Module({
  imports: [EnvModule],
  providers: [KafkaClient, UserCreatedProducer],
  exports: [UserCreatedProducer],
})
export class EventsModule {}
