import { Module } from '@nestjs/common';
import { EmailService } from './mail.service';
import { EmailController } from './mail.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/user.model'; // Путь к модели User должен быть обновлён
import { ProductModule } from '../products/product.module'; // Убедитесь, что путь к ProductModule верный
import { TemplateService } from 'src/mail/template.service';
import { ResendModule } from 'nestjs-resend';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ProductModule, // Импортируйте ProductModule здесь
    ResendModule.forRoot({
      apiKey: process.env.RESEND_API_KEY, // Использование переменной окружения
    }),
  ],
  controllers: [EmailController],
  providers: [EmailService, TemplateService],
})
export class EmailModule {}
