import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://admin:admin@cluster0.d83zfqn.mongodb.net/DoJewerly',
    ),
  ],
})
export class DatabaseModule {}
