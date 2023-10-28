import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Добавьте здесь вашу пользовательскую логику проверки токена JWT
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    // Логируем все заголовки
    console.log(request.headers);
    // Логируем заголовок авторизации
    console.log('Header: ', request.headers.authorization);
    console.log('Token: ', token);

    if (!token) {
      throw new UnauthorizedException('Нет действительного токена авторизации');
    }
    // Дополнительная проверка токена и принятие решения о его действительности
    return super.canActivate(context);
  }

  handleRequest(err, user) {
    // Обработка результата аутентификации

    console.log('Error', err);
    if (err || !user) {
      throw err || new UnauthorizedException('Ошибка аутентификации');
    }
    return user;
  }
}
