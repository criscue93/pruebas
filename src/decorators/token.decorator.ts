import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { verificarTokenPermisos } from 'src/helpers/verifyToken.helper';
import { IResponse } from '../interfaces/IResponse';

export const TokenDecorator = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    let response: IResponse = {
      error: true,
      message: 'Existe problemas con el token.',
      response: {},
      status: 401,
    };

    if (ctx.switchToHttp().getRequest().headers.authorization) {
      const authorization = ctx.switchToHttp().getRequest()
        .headers.authorization;

      const headers = { authorization };
      const token = headers.authorization.split(' ')[1];

      await verificarTokenPermisos(token)
        .then((resp) => (response = resp))
        .catch((err) => (response = err));
    }

    return response;
  },
);
