import { Module } from '@nestjs/common';
import { I18nModule } from 'nestjs-i18n';
import * as path from 'path';

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'), // указывается путь к папке i18n
        watch: true, // если true, файлы будут перезагружаться в реальном времени
      },
      resolvers: [
        // здесь указываются резолверы, если они вам нужны
      ],
    }),
  ],
})
export class AppModule {}
