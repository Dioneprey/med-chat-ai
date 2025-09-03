import { ScheduleOptions } from 'src/core/types/schedule-options';
import { SendEmailParams } from '../mail/send-email';

export abstract class SendEmailSchedule {
  abstract enqueueJob(
    data: SendEmailParams,
    options?: ScheduleOptions,
  ): Promise<void>;
}
