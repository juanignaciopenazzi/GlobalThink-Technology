import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RequestUser } from '../interfaces/request-user.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Buscamos qué roles exige el decorador @Roles() en la ruta
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 2. Si la ruta no exige roles, dejamos pasar a cualquiera
    if (!requiredRoles) {
      return true;
    }

    // 3. Obtenemos el request y le decimos a TypeScript qué forma tiene el usuario
    const request = context.switchToHttp().getRequest<{ user: RequestUser }>();
    const user: RequestUser = request.user;

    // Medida de seguridad extra: si no hay usuario en el request, lo rebotamos
    if (!user) {
      return false;
    }

    // 4. Verificamos si el rol del usuario está dentro de los roles permitidos
    return requiredRoles.includes(user.role);
  }
}
