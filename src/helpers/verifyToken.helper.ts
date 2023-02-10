import axios from 'axios';
import { IResponse } from '../interfaces/IResponse';

export const verificarTokenPermisos = async (
  token: any,
): Promise<IResponse> => {
  let response: IResponse = {
    error: true,
    message: `No se logró Verificar el Token.`,
    response: {},
    status: 401,
  };

  const seguridadUrl = process.env.SERVICE_LOGIN_URL;
  let url = `${seguridadUrl}/api/validate`;
  const dataJson = { token: token };

  try {
    await axios({
      method: 'POST',
      url,
      data: dataJson,
    })
      .then((res) => (response = res.data))
      .catch((err) => {
        if (err.response) {
          response = err.response.data;
        }
      });

    if (response.error === false) {
      const user = response.response;
      const dataJsonUser = { funcionarioId: user.funcionarioId };

      url = `${seguridadUrl}/api/permits`;
      await axios({
        method: 'POST',
        url,
        data: dataJsonUser,
      })
        .then((res) => (response = res.data))
        .catch((err) => {
          if (err.response) {
            response = err.response.data;
          }
        });

      if (!response.error) {
        response.message = 'Token válido';
        response.response = {
          usuario: user,
          permisos: response.response,
        };
      }
    } else {
      response.error = true;
      response.status = 401;
    }
  } catch (error) {
    response.response = error;
    response.status = 401;
  }

  return new Promise((resolve, reject) => {
    if (response.error) {
      reject(response);
    } else {
      resolve(response);
    }
  });
};
