import { Inject, Injectable } from '@nestjs/common';
import { sanitizeString } from 'src/helpers/sanitize.helper';
import { validatePassword } from 'src/helpers/validatePass.helper';
import { IResponse } from 'src/interfaces/IResponse';
import { UsuarioQueryService } from './usuario-query.service';
import { usuarioDTO } from './usuario.dto';

@Injectable()
export class UsuarioService {
  constructor(
    private readonly queryServiceData: UsuarioQueryService,
    @Inject('CONNECT_REPOSITORY')
    private connectRepository,
  ) {}

  async list(): Promise<IResponse> {
    /** Inicialización de Variables **/
    let response = {
      error: true,
      message:
        'Existen problemas con el servicio de listar todos los datos de la tabla.',
      response: {},
      status: 500,
    };

    /** Operación **/
    try {
      response = await this.queryServiceData.list();
    } catch (error) {
      response.error = true;
      response.message = 'No se pudo realizar la solicitud.';
      response.response = {
        errors: { solicitud: [`${error.message}`] },
      };
      response.status = 422;
    }

    /** Respuesta **/
    return response;
  }

  async listFilter(body: any) {
    /** Inicialización de Variables **/
    let response = {
      error: true,
      message:
        'Existen problemas con el servicio de listar todos los datos de la tabla con filtros.',
      response: {},
      status: 500,
    };

    /** Operación **/
    let field;
    if (body.sort[0].field == 'estado') {
      field = 'act.estado';
    } else if (body.sort[0].field == 'nombreActividad') {
      field = 'act.nombre';
    } else if (body.sort[0].field == 'nombreArea') {
      field = 'are.nombre';
    }
    const fiel = field;
    const type = `${sanitizeString(body.sort[0].type)}`;

    const data = {
      where: 'TRUE',
      whereValue: {},
      sortField: fiel,
      sortType: type,
      page: body.page || 1,
      perPage: body.perPage || 5,
      skip: 5,
    };

    data.skip = data.perPage * (data.page - 1);
    let where = '';

    if (body.columnFilters.nombreActividad) {
      where += ` AND act.nombre LIKE '%${body.columnFilters.nombreActividad}%'`;
    }

    if (body.columnFilters.estado >= 0) {
      where += ` AND act.estado = ${body.columnFilters.estado}`;
    }

    if (body.columnFilters.idArea) {
      where += ` AND are.id = ${body.columnFilters.idArea}`;
    }

    data.where += where;
    response = await this.queryServiceData.listFilter(data);

    /** Respuesta **/
    return response;
  }

  async insert(data: usuarioDTO, user: number): Promise<IResponse> {
    /** Inicialización de Variables **/
    let response = {
      error: true,
      message:
        'Existen problemas con el servicio de registrar nuevos datos a la tabla.',
      response: {},
      status: 500,
    };

    /** Operación **/
    try {
      const verify = validatePassword(data.password);

      if (verify) {
        const queryReturn = await this.connectRepository
          .createQueryBuilder()
          .select('user.numeroDocumento')
          .from('usuarios', 'user')
          .where('user.numeroDocumento = :numeroDocumento', { nombre: data.ci })
          .execute();

        if (queryReturn > 0) {
          response.error = true;
          response.message = `El usuario ${data.ci} ya se encuentra registrado.`;
          response.response = {
            errors: {
              solicitud: [`El usuario ${data.ci} ya se encuentra registrado.`],
            },
          };
          response.status = 422;
        } else {
          response = await this.queryServiceData.insert(data, user);
        }
      } else {
        response.error = true;
        response.message = 'La contraseña no cumple con los requisitos.';
        response.response = {
          password: ['La contraseña no cumple con los requisitos mínimos.'],
        };
        response.status = 422;
      }
    } catch (error) {
      response.error = true;
      response.message = 'No se pudo realizar la solicitud.';
      response.response = {
        errors: { solicitud: [`${error.message}`] },
      };
      response.status = 422;
    }

    /** Respuesta **/
    return response;
  }

  async update(data: usuarioDTO, id: number, user: number): Promise<IResponse> {
    /** Inicialización de Variables **/
    let response = {
      error: true,
      message:
        'Existen problemas con el servicio de editar los datos de una tupla.',
      response: {},
      status: 500,
    };

    /** Operación **/
    try {
      response = await this.queryServiceData.update(data, id, user);
    } catch (error) {
      response.error = true;
      response.message = 'No se pudo realizar la solicitud.';
      response.response = {
        errors: { solicitud: [`${error.message}`] },
      };
      response.status = 422;
    }

    /** Respuesta **/
    return response;
  }

  async status(id: number, user: number): Promise<IResponse> {
    /** Inicialización de Variables **/
    let response = {
      error: true,
      message:
        'Existen problemas con el servicio de cambiar el estado de una tupla.',
      response: {},
      status: 500,
    };

    /** Operación **/
    try {
      const queryReturn = await this.connectRepository
        .createQueryBuilder()
        .select('user.estado')
        .from('usuarios', 'user')
        .where('user.id = :id', { id })
        .execute();

      let estado = queryReturn.estado;
      if (estado === 1) {
        estado = 0;
      } else if (estado === 0) {
        estado = 1;
      }

      response = await this.queryServiceData.status(id, estado, user);
    } catch (error) {
      response.error = true;
      response.message = 'No se pudo realizar la solicitud.';
      response.response = {
        errors: { solicitud: [`${error.message}`] },
      };
      response.status = 422;
    }

    /** Respuesta **/
    return response;
  }

  async delete(id: number): Promise<IResponse> {
    /** Inicialización de Variables **/
    let response = {
      error: true,
      message: 'Existen problemas con el servicio de eliminar una tupla.',
      response: {},
      status: 500,
    };

    /** Operación **/
    try {
      response = await this.queryServiceData.delete(id);
    } catch (error) {
      response.error = true;
      response.message = 'No se pudo realizar la solicitud.';
      response.response = {
        errors: { solicitud: [`${error.message}`] },
      };
      response.status = 422;
    }

    /** Respuesta **/
    return response;
  }
}
