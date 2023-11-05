import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './users/user.controller';
import { DatabaseModule } from './database/database.module';
import { ProductModule } from './products/product.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/user.module';
import { CollectionsModule } from './collections/collections.module';
import { FavouritesModule } from './favourites/favourites.module';
import { CriteriaModule } from './catalog/criteria.module';
import { ArticlesModule } from './article/articles.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { EmailModule } from './mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { ResendModule } from 'nestjs-resend';
import { TemplateService } from 'src/mail/template.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // для обслуживания файлов из папки uploads
      serveRoot: '/uploads', // URL-путь для доступа к файлам
    }),
    DatabaseModule,
    AuthModule,
    UserModule,
    ProductModule,
    CollectionsModule,
    FavouritesModule,
    CriteriaModule,
    ArticlesModule,
    EmailModule,
    ConfigModule.forRoot({
      isGlobal: true, // no need to import into other modules
    }),
    ResendModule.forRoot({
      apiKey: process.env.RESEND_API_KEY, // Использование переменной окружения
    }),
  ],
  controllers: [AppController, UserController],
  providers: [AppService, TemplateService],
})
export class AppModule {}
