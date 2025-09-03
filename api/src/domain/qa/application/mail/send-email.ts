import { EmailTemplate } from 'src/core/types/email-template';

export interface SendEmailParams {
  recipientEmail: string;
  subject?: string;
  template: EmailTemplate; // enum
  variables: Record<string, string>;
}

export abstract class SendEmail {
  abstract send({
    recipientEmail,
    template,
    variables,
    subject,
  }: SendEmailParams): Promise<void>;
}
