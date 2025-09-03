import { InjectQueue } from '@nestjs/bullmq';
import { JobsOptions, Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { SEND_EMAIL_SCHEDULE_PROCESSOR } from '../processor/send-email-schedule.processor';
import { SendEmailParams } from 'src/domain/chat/application/mail/send-email';
import { SendEmailSchedule } from 'src/domain/chat/application/schedules/send-email.schedule';

@Injectable()
export class BullMQSendEmailScheduleService implements SendEmailSchedule {
  constructor(
    @InjectQueue(SEND_EMAIL_SCHEDULE_PROCESSOR)
    private readonly sendEmail: Queue<SendEmailParams>,
  ) {}

  async enqueueJob(data: SendEmailParams, options?: JobsOptions) {
    await this.sendEmail.add(SEND_EMAIL_SCHEDULE_PROCESSOR, data, options);
  }
}
