import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import {
  SendEmail,
  SendEmailParams,
} from 'src/domain/chat/application/mail/send-email';

export const SEND_EMAIL_SCHEDULE_PROCESSOR = 'send-email-schedule-processor';

@Processor(SEND_EMAIL_SCHEDULE_PROCESSOR)
export class SendEmailScheduleProcessor extends WorkerHost {
  private logger = new Logger(SendEmailScheduleProcessor.name);

  constructor(private sendEmail: SendEmail) {
    super();
  }

  async process(job: Job<SendEmailParams>): Promise<void> {
    await this.sendEmail.send(job.data);

    this.logger.debug(`Email for: ${job.data.recipientEmail} queued`);
  }
}
