export interface ScheduleOptions {
  delayMs?: number;
  attempts?: number;
  jobId?: string;
  removeOnFail?: boolean;
  onComplete?: boolean;
}
