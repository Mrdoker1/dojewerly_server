import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      console.log('No roles specified'); // Логирование отсутствия указанных ролей
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const userRole = user?.role;

    console.log('Logged User Role:', userRole); // Логирование роли пользователя

    if (!userRole) {
      console.log('No role defined for the user'); // Логирование отсутствия роли у пользователя
      return false;
    }

    return requiredRoles.includes(userRole);
  }
}
