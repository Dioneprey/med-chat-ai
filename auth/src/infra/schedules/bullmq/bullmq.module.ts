import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EnvModule } from 'src/infra/env/env.module';
import { EnvService } from 'src/infra/env/env.service';
import { BullBoardModule } from '@bull-board/nestjs';
import { FastifyAdapter } from '@bull-board/fastify';
import { DatabaseModule } from 'src/infra/database/database.module';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import {
  SEND_EMAIL_SCHEDULE_PROCESSOR,
  SendEmailScheduleProcessor,
} from './processor/send-email-schedule.processor';
import { BullMQSendEmailScheduleService } from './service/bullmq-send-email-schedule.service';
import { SendEmailSchedule } from 'src/domain/auth/application/schedules/send-email.schedule';
import { MailModule } from 'src/infra/mail/mail.module';

@Module({
  imports: [
    DatabaseModule,
    MailModule,
    BullModule.forRootAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: async (envService: EnvService) => ({
        connection: {
          host: envService.get('REDIS_HOST'),
          port: envService.get('REDIS_PORT'),
          password: envService.get('REDIS_PASSWORD'),
          db: 1,
        },
      }),
    }),
    BullModule.registerQueue({
      name: SEND_EMAIL_SCHEDULE_PROCESSOR,
    }),

    BullBoardModule.forRoot({
      route: '/queues',
      adapter: FastifyAdapter,
    }),

    BullBoardModule.forFeature({
      name: SEND_EMAIL_SCHEDULE_PROCESSOR,
      adapter: BullMQAdapter,
    }),
  ],
  providers: [
    SendEmailScheduleProcessor,
    {
      provide: SendEmailSchedule,
      useClass: BullMQSendEmailScheduleService,
    },
  ],
  exports: [BullModule, SendEmailSchedule],
})
export class BullMqConfigModule {}
