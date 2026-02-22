import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'juan.penazzi@example.com' })
  @IsEmail({}, { message: 'El formato del email no es válido' })
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'passwordSegura123' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
