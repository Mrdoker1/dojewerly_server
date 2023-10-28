import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';

// Использование переменной среды PORT, если она установлена, в противном случае фоллбэк на 4000
const port = process.env.PORT || 4000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*', // или замените '*' на домены, которые должны иметь доступ
  });
  setupSwagger(app);
  await app.listen(port);

  console.log(`App started at port ${port}`);
}
bootstrap();
