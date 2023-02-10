import { createParamDecorator } from '@nestjs/common';
import { IResponse } from '../interfaces/IResponse';

export const RespDecorator = createParamDecorator(() => {
  const response: IResponse = {
    error: false,
    message: 'Respuesta correcta',
    response: {},
    status: 200,
  };
  return response;
});
