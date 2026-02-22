import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

// PartialType hace que todas las propiedades de CreateUserDto sean opcionales
// pero mantiene las reglas de validación (ej: si mandás email, DEBE ser un email válido)
export class UpdateUserDto extends PartialType(CreateUserDto) {}
