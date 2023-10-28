import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    console.log(
      'Attempting to validate with email:',
      email,
      'and password:',
      password,
    );
    try {
      const user = await this.authService.validateUser(email, password);
      return user;
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw new UnauthorizedException(err.message);
      }
      throw err;
    }
  }
}
