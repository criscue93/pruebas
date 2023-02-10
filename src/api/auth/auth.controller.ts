import {
  Body,
  Controller,
  Ip,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { validate } from 'class-validator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { IResponse } from 'src/interfaces/IResponse';
import { RespDecorator } from 'src/decorators/resp.decorator';
import * as uaParser from 'ua-parser-js';
import { getIP } from 'src/helpers/util.helper';
import {
  loginDTO,
  tokenDTO,
  changePasswordDTO,
  permitDTO,
  recoverDTO,
  confirCodeDTO,
} from './auth.dto';

@ApiTags('LOGIN')
@Controller('api')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Servicio login de usuario.' })
  async login(
    @RespDecorator() resp: IResponse,
    @Res() res: Response,
    @Req() req: Request,
    @Ip() ip,
    @Body() body: loginDTO,
  ) {
    /* INICIALIZACION DE VARIABLES */
    let response = resp;

    /* OPERACION */
    if (!response.error) {
      const data = new loginDTO();
      data.usuario = body.usuario;
      data.password = body.password;
      data.aplicacion = body.aplicacion;

      const valida = await validate(data);
      if (valida.length > 0) {
        const errorArray = valida.map((o) => ({
          [o.property]: Object.values(o.constraints),
        }));
        let condi = 0;
        let errors = [];
        while (errorArray[condi] != undefined) {
          errors = Object.assign(errors, errorArray[condi]);
          condi++;
        }

        response.error = true;
        response.message = 'Error de validación.';
        response.response = { errors: { ...errors } };
        response.status = 422;
      } else {
        const headers = req.headers;
        const agent = new uaParser(`${headers['user-agent']}`);
        const userAgent = agent.getResult();
        const origen = {
          ip: getIP(ip),
          userAgent,
        };
        response = await this.authService.login(data, origen);
      }
    }

    /* RESPUESTA */
    return res.status(response.status).json(response);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Servicio validar token.' })
  async verifyToken(
    @RespDecorator() resp: IResponse,
    @Res() res: Response,
    @Body() body: tokenDTO,
  ) {
    /* INICIALIZACION DE VARIABLES */
    let response = resp;

    /* OPERACION */
    if (response.error === false) {
      const data = new tokenDTO();
      data.token = body.token;

      const valida = await validate(data);
      if (valida.length > 0) {
        const errorArray = valida.map((o) => ({
          [o.property]: Object.values(o.constraints),
        }));
        let condi = 0;
        let errors = [];
        while (errorArray[condi] != undefined) {
          errors = Object.assign(errors, errorArray[condi]);
          condi++;
        }

        response.error = true;
        response.message = 'Error de validación.';
        response.response = { errors: { ...errors } };
        response.status = 422;
      } else {
        response = await this.authService.validateToken(data);
      }
    }

    /* RESPUESTA */
    return res.status(response.status).json(response);
  }

  @Post('permits')
  @ApiOperation({ summary: 'Servicio obtener los permisos.' })
  async permits(
    @RespDecorator() resp: IResponse,
    @Res() res: Response,
    @Body() body: permitDTO,
  ) {
    /* INICIALIZACION DE VARIABLES */
    let response = resp;

    /* OPERACION */
    if (response.error === false) {
      const data = new permitDTO();
      data.funcionarioId = body.funcionarioId;

      const valida = await validate(data);
      if (valida.length > 0) {
        const errorArray = valida.map((o) => ({
          [o.property]: Object.values(o.constraints),
        }));
        let condi = 0;
        let errors = [];
        while (errorArray[condi] != undefined) {
          errors = Object.assign(errors, errorArray[condi]);
          condi++;
        }

        response.error = true;
        response.message = 'Error de validación.';
        response.response = { errors: { ...errors } };
        response.status = 422;
      } else {
        response = await this.authService.permits(data);
      }
    }

    /* RESPUESTA */
    return res.status(response.status).json(response);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Servicio refrescar token.' })
  async refresh(
    @RespDecorator() resp: IResponse,
    @Res() res: Response,
    @Req() req: Request,
    @Ip() ip,
    @Body() body: tokenDTO,
  ) {
    /* INICIALIZACION DE VARIABLES */
    let response = resp;

    /* OPERACION */
    if (response.error === false) {
      const data = new tokenDTO();
      data.token = body.token;

      const valida = await validate(data);
      if (valida.length > 0) {
        const errorArray = valida.map((o) => ({
          [o.property]: Object.values(o.constraints),
        }));
        let condi = 0;
        let errors = [];
        while (errorArray[condi] != undefined) {
          errors = Object.assign(errors, errorArray[condi]);
          condi++;
        }

        response.error = true;
        response.message = 'Error de validación.';
        response.response = { errors: { ...errors } };
        response.status = 422;
      } else {
        const headers = req.headers;
        const agent = new uaParser(`${headers['user-agent']}`);
        const userAgent = agent.getResult();
        const origen = {
          ip: getIP(ip),
          userAgent,
        };
        response = await this.authService.refreshToken(data, origen);
      }
    }

    /* RESPUESTA */
    return res.status(response.status).json(response);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Servicio logout.' })
  async logoutV2(
    @RespDecorator() resp: IResponse,
    @Res() res: Response,
    @Body() body: tokenDTO,
  ) {
    /* INICIALIZACION DE VARIABLES */
    let response = resp;

    /* OPERACION */
    if (response.error === false) {
      const data = new tokenDTO();
      data.token = body.token;

      const valida = await validate(data);
      if (valida.length > 0) {
        const errorArray = valida.map((o) => ({
          [o.property]: Object.values(o.constraints),
        }));
        let condi = 0;
        let errors = [];
        while (errorArray[condi] != undefined) {
          errors = Object.assign(errors, errorArray[condi]);
          condi++;
        }

        response.error = true;
        response.message = 'Error de validación.';
        response.response = { errors: { ...errors } };
        response.status = 422;
      } else {
        response = await this.authService.logoutTokenV2(data);
      }
    }

    /* RESPUESTA */
    return res.status(response.status).json(response);
  }

  @Post('recover')
  @ApiOperation({ summary: 'Servicio recuperar la contraseña.' })
  async recoverPassword(
    @RespDecorator() resp: IResponse,
    @Res() res: Response,
    @Body() body: recoverDTO,
  ) {
    /* INICIALIZACION DE VARIABLES */
    let response = resp;

    /* OPERACION */
    if (response.error === false) {
      const data = new recoverDTO();
      data.usuario = body.usuario;
      data.aplicacion = body.aplicacion;

      const valida = await validate(data);
      if (valida.length > 0) {
        const errorArray = valida.map((o) => ({
          [o.property]: Object.values(o.constraints),
        }));
        let condi = 0;
        let errors = [];
        while (errorArray[condi] != undefined) {
          errors = Object.assign(errors, errorArray[condi]);
          condi++;
        }

        response.error = true;
        response.message = 'Error de validación.';
        response.response = { errors: { ...errors } };
        response.status = 422;
      } else {
        response = await this.authService.recoverPassword(data);
      }
    }

    /* RESPUESTA */
    return res.status(response.status).json(response);
  }

  @Post('confirmcode')
  @ApiOperation({
    summary: 'Servicio de confirmación del codigo en cambio de contraseña.',
  })
  async confirmCode(
    @RespDecorator() resp: IResponse,
    @Res() res: Response,
    @Body() body: confirCodeDTO,
  ) {
    /* INICIALIZACION DE VARIABLES */
    let response = resp;

    /* OPERACION */
    if (!response.error) {
      const data = new confirCodeDTO();
      data.usuario = body.usuario;
      data.aplicacion = body.aplicacion;
      data.code = body.code;
      data.codigoid = body.codigoid;

      const valida = await validate(data);
      if (valida.length > 0) {
        const errorArray = valida.map((o) => ({
          [o.property]: Object.values(o.constraints),
        }));
        let condi = 0;
        let errors = [];
        while (errorArray[condi] != undefined) {
          errors = Object.assign(errors, errorArray[condi]);
          condi++;
        }

        response.error = true;
        response.message = 'Error de validación.';
        response.response = { errors: { ...errors } };
        response.status = 422;
      } else {
        response = await this.authService.confirmCode(data);
      }
    }

    /* RESPUESTA */
    return res.status(response.status).json(response);
  }

  @Post('change')
  @ApiOperation({ summary: 'Servicio cambio de contraseña.' })
  async changePassword(
    @RespDecorator() resp: IResponse,
    @Res() res: Response,
    @Body() body: changePasswordDTO,
  ) {
    /* INICIALIZACION DE VARIABLES */
    let response = resp;

    /* OPERACION */
    if (response.error === false) {
      const data = new changePasswordDTO();
      data.usuario = body.usuario;
      data.aplicacion = body.aplicacion;
      data.code = body.code;
      data.newPassword = body.newPassword;
      data.confirmPassword = body.confirmPassword;

      const valida = await validate(data);
      if (valida.length > 0) {
        const errorArray = valida.map((o) => ({
          [o.property]: Object.values(o.constraints),
        }));
        let condi = 0;
        let errors = [];
        while (errorArray[condi] != undefined) {
          errors = Object.assign(errors, errorArray[condi]);
          condi++;
        }

        response.error = true;
        response.message = 'Error de validación.';
        response.response = { errors: { ...errors } };
        response.status = 422;
      } else {
        response = await this.authService.changePassword(data);
      }
    }

    /* RESPUESTA */
    return res.status(response.status).json(response);
  }
}
