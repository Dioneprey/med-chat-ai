import { InjectQueue } from '@nestjs/bullmq';
import { JobsOptions, Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { SEND_EMAIL_SCHEDULE_PROCESSOR } from '../processor/send-email-schedule.processor';
import { SendEmailSchedule } from 'src/domain/auth/application/schedules/send-email.schedule';
import { SendEmailParams } from 'src/domain/auth/application/mail/send-email';

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
