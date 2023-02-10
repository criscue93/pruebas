import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsInt, IsString, MinLength } from 'class-validator';

export class loginDTO {
  @ApiProperty()
  @IsString({ message: 'La usuario debe ser cadena.' })
  @IsDefined({ message: 'El usuario es obligatorio.' })
  @MinLength(1, {
    message: 'El campo usuario debe contener al menos 1 caracter.',
  })
  usuario: string;

  @ApiProperty()
  @IsString({ message: 'La contraseña debe ser cadena.' })
  @IsDefined({ message: 'La contraseña es obligatorio.' })
  @MinLength(3, {
    message: 'La contraseña debe tener como mínimo 3 caracteres.',
  })
  password: string;

  @ApiProperty()
  @IsString({ message: 'El nombre de la aplicación debe ser cadena.' })
  @IsDefined({ message: 'El nombre de la aplicación es obligatorio.' })
  @MinLength(2, {
    message: 'El nombre de la aplicación debe contener al menos 2 caracter.',
  })
  aplicacion: string;
}

export class tokenDTO {
  @ApiProperty()
  @IsString({ message: 'El token debe ser cadena.' })
  @IsDefined({ message: 'El token es obligatorio.' })
  @MinLength(1, {
    message: 'El token debe contener al menos 1 caracter.',
  })
  token: string;
}

export class permitDTO {
  @ApiProperty()
  @IsInt({ message: 'El id del funcionario debe de ser número entero.' })
  @IsDefined({ message: 'El id del funcionario es obligatorio.' })
  funcionarioId: number;
}

export class recoverDTO {
  @ApiProperty()
  @IsString({ message: 'La usuario debe ser cadena.' })
  @IsDefined({ message: 'El usuario es obligatorio.' })
  @MinLength(1, {
    message: 'El campo usuario debe contener al menos 1 caracter.',
  })
  usuario: string;

  @ApiProperty()
  @IsString({ message: 'La aplicación debe ser cadena.' })
  @IsDefined({ message: 'La aplicación es obligatorio.' })
  @MinLength(2, {
    message: 'La aplicación debe tener como mínimo 2 caracteres.',
  })
  aplicacion: string;
}

export class confirCodeDTO {
  @ApiProperty()
  @IsString({ message: 'La usuario debe ser cadena.' })
  @IsDefined({ message: 'El usuario es obligatorio.' })
  @MinLength(1, {
    message: 'El campo usuario debe contener al menos 1 caracter.',
  })
  usuario: string;

  @ApiProperty()
  @IsString({ message: 'La aplicación debe ser cadena.' })
  @IsDefined({ message: 'La aplicación es obligatorio.' })
  @MinLength(2, {
    message: 'La aplicación debe tener como mínimo 2 caracteres.',
  })
  aplicacion: string;

  @ApiProperty()
  @IsInt({
    message:
      'El codigo de confirmacion proporcionado por el usuario debe de ser número entero.',
  })
  @IsDefined({
    message:
      'El codigo de confirmacion proporcionado por el usuario es obligatorio.',
  })
  code: number;

  @ApiProperty()
  codigoid: number;
}

export class changePasswordDTO {
  @ApiProperty()
  @IsString({ message: 'La usuario debe ser cadena.' })
  @IsDefined({ message: 'El usuario es obligatorio.' })
  @MinLength(3, {
    message: 'El campo usuario debe contener al menos 3 caracter.',
  })
  usuario: string;

  @ApiProperty()
  @IsString({ message: 'La aplicación debe ser cadena.' })
  @IsDefined({ message: 'La aplicación es obligatorio.' })
  @MinLength(2, {
    message: 'La aplicación debe tener como mínimo 2 caracteres.',
  })
  aplicacion: string;

  @ApiProperty()
  @IsInt({
    message:
      'El codigo de confirmacion proporcionado por el usuario debe de ser número entero.',
  })
  @IsDefined({
    message:
      'El codigo de confirmacion proporcionado por el usuario es obligatorio.',
  })
  code: number;

  @ApiProperty()
  @IsString({ message: 'La contraseña debe ser cadena.' })
  @IsDefined({ message: 'La contraseña es obligatorio.' })
  @MinLength(3, {
    message: 'La contraseña debe tener como mínimo 3 caracteres.',
  })
  newPassword: string;

  @ApiProperty()
  @IsString({ message: 'La nueva contraseña debe ser cadena.' })
  @IsDefined({ message: 'La nueva contraseña es obligatorio.' })
  @MinLength(3, {
    message: 'La nueva contraseña debe tener como mínimo 3 caracteres.',
  })
  confirmPassword: string;
}
