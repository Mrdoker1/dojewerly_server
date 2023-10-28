import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../users/user.service';
import { UserDocument } from '../users/user.model';
import { StorageService } from './storage.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private storageService: StorageService, // Добавьте StorageService в конструктор
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any): Promise<UserDocument> {
    console.log('Validating JWT with payload:', payload);
    const user = await this.userService.findById(payload.sub);
    user.role = payload.roles;

    const token = this.storageService.getItem('token'); // Получите токен из хранилища
    if (!token) {
      throw new UnauthorizedException('Token has been invalidated'); // Если токена нет, он был инвалидирован
    }

    return user;
  }
}
