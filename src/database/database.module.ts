import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(), // Убедитесь, что загружен ConfigModule
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'), // Используйте ConfigService для получения переменной окружения
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
