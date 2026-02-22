import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
// Este decorador recibe una lista de roles (ej: 'admin', 'user') y los guarda en los metadatos de la ruta
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
