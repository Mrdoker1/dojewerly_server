import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication) {
  // Настройка Swagger
  const options = new DocumentBuilder()
    .setTitle('DoJewerly')
    .setDescription('NestJS MVP stage#1 API')
    .setVersion('0.1')
    .addBearerAuth() // Добавление поддержки Bearer-токена
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
}
