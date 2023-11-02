import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from './../users/user.model'; // Предполагается, что у вас есть User entity

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(user: User, token: string) {
    const url = `http://example.com/auth/confirm?token=${token}`; // URL для подтверждения

    await this.mailerService.sendMail({
      to: user.email, // Электронный адрес получателя
      subject: 'Welcome to Nice App! Confirm your Email', // Тема письма
      template: './confirmation', // Используемый шаблон
      context: {
        // Переменные для шаблона
        name: user.username,
        url,
      },
    });
  }
}
