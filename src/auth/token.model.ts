import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TokenDocument = Token & Document;

export const TOKEN_LIVE_TIME = '1h';

@Schema()
export class Token {
  @Prop({ required: true })
  token: string;

  @Prop({ required: true })
  userId: string;

  // Добавить это поле
  @Prop({ default: Date.now, index: { expires: TOKEN_LIVE_TIME } }) // Установить TTL на 1 час
  createdAt: Date;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
