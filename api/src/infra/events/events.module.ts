import { Module } from '@nestjs/common';
import { KafkaClient } from './kafka/kafka-client.service';
import { UserCreatedConsumer } from './kafka/consumers/user-created.consumer';
import { EnvModule } from '../env/env.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [EnvModule, DatabaseModule],
  providers: [KafkaClient, UserCreatedConsumer],
})
export class EventsModule {}
