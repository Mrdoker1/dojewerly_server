import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';

const port = 4000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*', // или замените '*' на домены, которые должны иметь доступ
  });
  setupSwagger(app);
  await app.listen(port);

  console.log('App startred at port', port);
}
bootstrap();
