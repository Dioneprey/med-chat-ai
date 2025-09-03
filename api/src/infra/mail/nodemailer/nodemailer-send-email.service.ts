import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { render } from '@react-email/render';
import {
  SendEmail,
  SendEmailParams,
} from 'src/domain/qa/application/mail/send-email';
import { EmailTemplate } from 'src/core/types/email-template';
import InvitationEmail from '../templates/invitation';
import { EnvService } from 'src/infra/env/env.service';

@Injectable()
export class NodeMailerSendEmailService implements SendEmail {
  constructor(
    private mailerService: MailerService,
    private envService: EnvService,
  ) {}

  async send({
    recipientEmail,
    template,
    subject,
    variables,
  }: SendEmailParams) {
    if (this.envService.get('NODE_ENV') !== 'production') {
      return console.log({
        recipientEmail: recipientEmail,
        subject: subject,
        message: Object.entries(variables)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', '),
      });
    }

    let html: string;

    switch (template) {
      case EmailTemplate.INVITATION:
        html = await render(
          InvitationEmail({
            invitationCode: variables.invitationCode,
            companyName: variables.companyName,
          }),
        );
        break;
      default:
        throw new Error(`Template ${template} não implementado`);
    }

    await this.mailerService.sendMail({
      to: recipientEmail,
      subject: subject ?? 'MedChatIA',
      html: `${html}`,
    });
  }
}
