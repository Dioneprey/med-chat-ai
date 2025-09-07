import { ScheduleOptions } from 'src/core/types/schedule-options';
import { SendEmailParams } from 'src/domain/auth/application/mail/send-email';
import { SendEmailSchedule } from 'src/domain/auth/application/schedules/send-email.schedule';

interface ScheduledJob {
  data: SendEmailParams;
  options?: ScheduleOptions;
}

export class FakeSendEmailSchedule extends SendEmailSchedule {
  public jobs: ScheduledJob[] = [];

  async enqueueJob(
    data: SendEmailParams,
    options?: ScheduleOptions,
  ): Promise<void> {
    this.jobs.push({ data, options });
  }
}
