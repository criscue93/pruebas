import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IResponse } from 'src/interfaces/IResponse';
import { usuarioDTO } from './usuario.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuarioQueryService {
  constructor(
    @Inject('CONNECT_REPOSITORY')
    private connectRepository,
  ) {}

  async list(): Promise<IResponse> {
    /** Inicialización de Variables **/
    const response = {
      error: true,
      message:
        'Existen problemas con el servicio de listar todos los datos de la tabla con filtros.',
      response: {},
      status: 500,
    };

    /** Operación **/
    try {
      const queryReturn = await this.connectRepository
        .createQueryBuilder()
        .select(
          'user.nombreCompleto, user.numeroDocumento, user.celular, user.email',
        )
        .from('usuarios', 'user')
        .where('user.estado = :estado', { estado: 1 })
        .execute();

      if (queryReturn > 0) {
        response.error = false;
        response.message = 'Se logró obtener todos los datos.';
        response.response = queryReturn;
        response.status = 201;
      } else if (queryReturn == 0) {
        response.error = false;
        response.message = 'Se logró obtener todos los datos.';
        response.response = [];
        response.status = 201;
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

  async listFilter(data: any): Promise<IResponse> {
    /** Inicialización de Variables **/
    const response = {
      error: true,
      message:
        'Existen problemas con el servicio de listar todos los datos de la tabla con filtros.',
      response: {},
      status: 500,
    };

    /** Operación **/
    try {
      const queryReturn = await this.connectRepository
        .createQueryBuilder()
        .select(
          'user.nombreCompleto, user.numeroDocumento, user.celular, user.email',
        )
        .from('usuarios', 'user')
        .where(data.where, data.whereValue)
        .orderBy(data.order.sortField, data.order.sortType)
        .offset(data.order.skip)
        .limit(data.order.limit)
        .execute();

      response.error = false;
      response.message = 'Se logró obtener todos los datos.';
      response.response = {
        records: queryReturn,
        total: queryReturn.length,
      };
      response.status = 201;
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

  async insert(data: usuarioDTO, user: number): Promise<IResponse> {
    /** Inicialización de Variables **/
    const response = {
      error: true,
      message:
        'Existen problemas con el servicio de registrar nuevos datos a la tabla.',
      response: {},
      status: 500,
    };

    /** Operación **/
    try {
      const hashedPassword = await bcrypt.hash(String(data.password), 12);
      const queryReturn = await this.connectRepository
        .createQueryBuilder()
        .insert()
        .into('usuarios')
        .values({
          usuario: data.usuario,
          password: hashedPassword,
          nombreCompleto: `${data.nombre} ${data.paterno} ${data.materno}`,
          nombre: data.nombre,
          paterno: data.paterno,
          materno: data.materno,
          numeroDocumento: data.ci,
          celular: data.celular,
          direccion: data.direccion,
          email: data.email,
          funcionarioIdCreate: user,
          funcionarioIdUpdate: user,
        })
        .execute();

      response.error = false;
      response.message = 'Se lograron registrar los datos correctamente.';
      response.response = queryReturn.identifiers[0].id;
      response.status = 200;
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
    const response = {
      error: true,
      message:
        'Existen problemas con el servicio de editar los datos de una tupla.',
      response: {},
      status: 500,
    };

    /** Operación **/
    try {
      const queryReturn = await this.connectRepository
        .createQueryBuilder()
        .update('usuarios')
        .set({
          nombreCompleto: `${data.nombre} ${data.paterno} ${data.materno}`,
          nombre: data.nombre,
          paterno: data.paterno,
          materno: data.materno,
          numeroDocumento: data.ci,
          celular: data.celular,
          direccion: data.direccion,
          email: data.email,
          funcionarioIdUpdate: user,
        })
        .where('id = :id', { id })
        .execute();

      response.error = false;
      response.message = 'Se lograron modificar los datos correctamente.';
      response.response = queryReturn.affected;
      response.status = 200;
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

  async status(id: number, estado: number, user: number): Promise<IResponse> {
    /** Inicialización de Variables **/
    const response = {
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
        .update('usuarios')
        .set({
          estado,
          funcionarioIdUpdate: user,
        })
        .where('id = :id', { id })
        .execute();

      response.error = false;
      response.message = 'Se lograron modificar los datos correctamente.';
      response.response = queryReturn.affected;
      response.status = 200;
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
    const response = {
      error: true,
      message: 'Existen problemas con el servicio de eliminar una tupla.',
      response: {},
      status: 500,
    };

    /** Operación **/
    try {
      const queryReturn = await this.connectRepository
        .createQueryBuilder()
        .delete()
        .from('usuarios')
        .where('id = :id', { id })
        .execute();

      response.error = false;
      response.message = 'Se lograron eliminar los datos correctamente.';
      response.response = queryReturn.affected;
      response.status = 200;
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

  async getOne(id: any): Promise<IResponse> {
    const queryReturn = await this.connectRepository
      .createQueryBuilder()
      .select('user.id')
      .from('usuarios', 'user')
      .where('user.id = :id', { id })
      .execute();

    if (!queryReturn)
      throw new NotFoundException('El usuario no existe o no esta autorizado');

    return queryReturn;
  }
}
