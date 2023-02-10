import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsEmail,
  IsInt,
  IsString,
  MinLength,
} from 'class-validator';

export class usuarioDTO {
  @ApiProperty()
  @IsString({ message: 'El nombre de usuario debe ser cadena' })
  @IsDefined({ message: 'El nombre de usuario es obligatorio' })
  @MinLength(1, {
    message: 'El nombre de usuario debe contener al menos 1 caracter',
  })
  usuario: string;

  @ApiProperty()
  @IsString({ message: 'El password debe ser cadena' })
  @IsDefined({ message: 'El password es obligatorio' })
  @MinLength(1, {
    message: 'El password debe contener al menos 1 caracter',
  })
  password: string;

  @ApiProperty()
  @IsString({ message: 'El nombre debe ser cadena' })
  @IsDefined({ message: 'El nombre es obligatorio' })
  @MinLength(1, {
    message: 'El nombre debe contener al menos 1 caracter',
  })
  nombre: string;

  @ApiProperty()
  @IsString({ message: 'El apellido paterno debe ser cadena' })
  paterno: string;

  @ApiProperty()
  @IsString({ message: 'El apellido materno debe ser cadena' })
  materno: string;

  @ApiProperty()
  @IsString({ message: 'El ci debe ser cadena' })
  @IsDefined({ message: 'El ci es obligatorio' })
  @MinLength(1, {
    message: 'El ci debe contener al menos 1 caracter',
  })
  ci: string;

  @ApiProperty()
  @IsString({ message: 'La direccion debe ser cadena' })
  @IsDefined({ message: 'La direccion es obligatorio' })
  @MinLength(1, {
    message: 'La direccion debe contener al menos 1 caracter',
  })
  direccion: string;

  @ApiProperty()
  @IsInt({ message: 'El celular debe ser número entero.' })
  @IsDefined({ message: 'El celular es obligatorio.' })
  celular: number;

  @ApiProperty()
  @IsEmail()
  @IsDefined({ message: 'El correo es obligatorio.' })
  @MinLength(1, {
    message: 'El correo debe contener al menos 1 caracter.',
  })
  email: string;
}
