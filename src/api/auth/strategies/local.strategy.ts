import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'usuario',
      passwordField: 'password',
    });
  }

  async validate(usuario: string, password: string) {
    const user = await this.authService.validateUser(usuario, password);
    if (!user) throw new UnauthorizedException('No existe usuario');
    return user.response;
  }
}
