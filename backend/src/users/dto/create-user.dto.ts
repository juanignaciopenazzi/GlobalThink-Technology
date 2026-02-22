import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../schemas/user.schema';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  // --- Credenciales de Usuario ---
  @ApiProperty({
    example: 'juan.penazzi@example.com',
    description: 'Correo electrónico del usuario',
  })
  @IsEmail({}, { message: 'El formato del email no es válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email!: string;

  @ApiProperty({
    example: 'passwordSegura123',
    description: 'Debe tener al menos 6 caracteres',
  })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password!: string;

  @ApiProperty({
    enum: UserRole,
    default: UserRole.USER,
    required: false,
  })
  @IsEnum(UserRole, { message: 'El rol proporcionado no es válido' })
  @IsOptional()
  role?: UserRole;

  // --- Datos del Perfil ---
  @ApiProperty({ example: 'Juan' })
  @IsString({ message: 'El primer nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El primer nombre es obligatorio' })
  firstName!: string;

  @ApiProperty({ example: 'Ignacio' })
  @IsString()
  @IsOptional()
  secondName?: string;

  @ApiProperty({ example: 'Penazzi' })
  @IsString({ message: 'El apellido debe ser un texto' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  lastName!: string;

  @ApiProperty({ example: '+5491123456789', required: false })
  @IsString()
  @IsOptional()
  phone?: string;
}
