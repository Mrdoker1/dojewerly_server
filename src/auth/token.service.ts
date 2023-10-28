import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Token, TokenDocument } from './token.model';

@Injectable()
export class TokenService {
  constructor(
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
  ) {}

  async create(token: string, userId: string): Promise<Token> {
    // Удалить существующий токен этого пользователя, если он есть
    await this.tokenModel.deleteOne({ userId });
    // Создать новый токен
    const newToken = new this.tokenModel({ token, userId });
    return newToken.save();
  }
  async delete(token: string): Promise<any> {
    return this.tokenModel.deleteOne({ token });
  }

  async exists(token: string): Promise<boolean> {
    const doc = await this.tokenModel.findOne({ token });
    return Boolean(doc);
  }
}
