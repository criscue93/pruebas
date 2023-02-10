import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Auth_Funcionarios } from 'src/entitys/seguridad/funcionarios.entity';
import { IResponse } from 'src/interfaces/IResponse';
import { Connection as TypeormConnection } from 'typeorm';
import { Auth_Doble_Autenticacion } from '../../entitys/seguridad/doble.entity';
import { Auth_Recover } from '../../entitys/seguridad/recover.entity';
import { Auth_Global } from '../../entitys/seguridad/global.entity';

@Injectable()
export class AuthQueryService {
  constructor(
    @InjectConnection('seguridadWrite')
    private seguridadWrite: TypeormConnection,
  ) {}

  async updatePassword(id: number, newPassword: string): Promise<IResponse> {
    /* INICIALIZACION DE VARIABLES */
    const response = {
      error: true,
      message: 'Existen problemas con el servicio de editar la contraseña.',
      response: {},
      status: 500,
    };

    /* OPERACION */
    try {
      const updateReturn = await this.seguridadWrite
        .getRepository(Auth_Funcionarios)
        .createQueryBuilder()
        .update()
        .set({
          password: newPassword,
        })
        .where('id = :id', { id })
        .execute();

      if (updateReturn) {
        response.error = false;
        response.message =
          'Se logró cambiar la contraseña del funcionario correctamente.';
        response.response = updateReturn.affected;
        response.status = 201;
      } else {
        response.error = true;
        response.message = 'No se logró cambiar la contraseña del funcionario.';
        response.response = {
          errors: {
            funcionario: ['No se logró cambiar la contraseña del funcionario.'],
          },
        };
        response.status = 422;
      }
    } catch (error) {
      response.error = true;
      response.message = 'No se pudo realizar la solicitud.';
      response.response = {
        errors: {
          funcionario: [`${error.message}`],
        },
      };
      response.status = 422;
    }

    /* RESPUESTA */
    return response;
  }

  async insertConfirmacion(
    funcionarioId: any,
    aplicacionId: any,
    code: number,
  ): Promise<IResponse> {
    /* INICIALIZACION DE VARIABLES */
    const response = {
      error: true,
      message:
        'Existen problemas con el servicio de registrar la doble autenticación.',
      response: {},
      status: 500,
    };

    /* OPERACION */
    try {
      const dateSesion = new Date();
      const insertReturn = await this.seguridadWrite
        .getRepository(Auth_Doble_Autenticacion)
        .createQueryBuilder()
        .insert()
        .into(Auth_Doble_Autenticacion)
        .values({
          codigo: code,
          funcionarios: funcionarioId,
          aplicaciones: aplicacionId,
          fecha: dateSesion,
        })
        .execute();

      if (insertReturn) {
        response.error = false;
        response.message =
          'Se logró registrar la doble autenticación correctamente.';
        response.response = insertReturn.identifiers[0].id;
        response.status = 201;
      } else {
        response.error = true;
        response.message = 'No se logró la doble autenticación.';
        response.response = {
          errors: {
            confirmacion: ['No se pudo la doble autenticación.'],
          },
        };
        response.status = 422;
      }
    } catch (error) {
      response.error = true;
      response.message = 'No se pudo realizar la solicitud.';
      response.response = {
        errors: {
          confirmacion: [`${error.message}`],
        },
      };
      response.status = 422;
    }

    /* RESPUESTA */
    return response;
  }

  async insertRecover(
    funcionarioId: any,
    aplicacionId: any,
    code: number,
  ): Promise<IResponse> {
    /* INICIALIZACION DE VARIABLES */
    const response = {
      error: true,
      message: 'Existen problemas con el servicio de recuperar la contraseña.',
      response: {},
      status: 500,
    };

    /* OPERACION */
    try {
      const dateSesion = new Date();
      const insertReturn = await this.seguridadWrite
        .getRepository(Auth_Recover)
        .createQueryBuilder()
        .insert()
        .into(Auth_Recover)
        .values({
          codigo: code,
          funcionarios: funcionarioId,
          aplicaciones: aplicacionId,
          fecha: dateSesion,
          funcionarioIdCreate: funcionarioId,
          funcionarioIdUpdate: funcionarioId,
        })
        .execute();

      if (insertReturn) {
        response.error = false;
        response.message =
          'Se logró registrar la recuperación de la contraseña correctamente.';
        response.response = insertReturn.identifiers[0].id;
        response.status = 201;
      } else {
        response.error = true;
        response.message = 'No se logró la recuperación de la contraseña.';
        response.response = {
          errors: {
            confirmacion: ['No se pudo la recuperación de la contraseña.'],
          },
        };
        response.status = 422;
      }
    } catch (error) {
      response.error = true;
      response.message = 'No se pudo realizar la solicitud.';
      response.response = {
        errors: {
          confirmacion: [`${error.message}`],
        },
      };
      response.status = 422;
    }

    /* RESPUESTA */
    return response;
  }

  async selectConfirmacion(
    funcionarioId: any,
    aplicacionId: any,
  ): Promise<IResponse> {
    /* INICIALIZACION DE VARIABLES */
    const response = {
      error: true,
      message:
        'Existen problemas con el servicio de seleccionar la doble autenticación del funcionario.',
      response: {},
      status: 500,
    };

    /* OPERACION */
    try {
      const selectReturn = await this.seguridadWrite
        .createQueryBuilder()
        .select()
        .from(Auth_Doble_Autenticacion, 'doble')
        .where(`doble.funcionarioId = ${funcionarioId}`)
        .andWhere(`doble.aplicacionId = ${aplicacionId}`)
        .orderBy('doble.id', 'DESC')
        .limit(1)
        .execute();

      if (selectReturn.length > 0) {
        response.error = false;
        response.message =
          'Se logró obtener los datos de la doble autenticación.';
        response.response = selectReturn;
        response.status = 201;
      } else {
        response.error = true;
        response.message =
          'No se logró obtener los datos de la doble autenticación.';
        response.response = {
          errors: {
            confirmacion: [
              'No se logró obtener los datos de la doble autenticación.',
            ],
          },
        };
        response.status = 422;
      }
    } catch (error) {
      response.error = true;
      response.message = 'No se pudo realizar la solicitud.';
      response.response = {
        errors: {
          confirmacion: [`${error.message}`],
        },
      };
      response.status = 422;
    }

    /* RESPUESTA */
    return response;
  }

  async selectRecover(
    funcionarioId: any,
    aplicacionId: any,
  ): Promise<IResponse> {
    /* INICIALIZACION DE VARIABLES */
    const response = {
      error: true,
      message:
        'Existen problemas con el servicio de seleccionar la doble autenticación del funcionario.',
      response: {},
      status: 500,
    };

    /* OPERACION */
    try {
      const selectReturn = await this.seguridadWrite
        .createQueryBuilder()
        .select()
        .from(Auth_Recover, 'rec')
        .where(`rec.funcionarioId = ${funcionarioId}`)
        .andWhere(`rec.aplicacionId = ${aplicacionId}`)
        .orderBy('rec.id', 'DESC')
        .limit(1)
        .execute();

      if (selectReturn.length > 0) {
        response.error = false;
        response.message =
          'Se logró obtener los datos de la recuperación de contraseña.';
        response.response = selectReturn;
        response.status = 201;
      } else {
        response.error = true;
        response.message =
          'No se logró obtener los datos de la recuperación de contraseña.';
        response.response = {
          errors: {
            recover: [
              'No se logró obtener los datos de la recuperación de contraseña.',
            ],
          },
        };
        response.status = 422;
      }
    } catch (error) {
      response.error = true;
      response.message = 'No se pudo realizar la solicitud.';
      response.response = {
        errors: {
          recover: [`${error.message}`],
        },
      };
      response.status = 422;
    }

    /* RESPUESTA */
    return response;
  }

  async selectConfirmCode_old(
    funcionarioId: any,
    aplicacionId: any,
  ): Promise<IResponse> {
    /* INICIALIZACION DE VARIABLES */
    const response = {
      error: true,
      message:
        'Existen problemas con el servicio de seleccionar los datos del codigo para el cambio de contraseña.',
      response: {},
      status: 500,
    };
    /* OPERACION */
    try {
      const selectReturn = await this.seguridadWrite
        .createQueryBuilder()
        .select()
        .from(Auth_Recover, 'rec')
        .where(`rec.funcionarioId = ${funcionarioId}`)
        .andWhere(`rec.aplicacionId = ${aplicacionId}`)
        .orderBy('rec.id', 'DESC')
        .limit(1)
        .execute();
      if (selectReturn.length > 0) {
        response.error = false;
        response.message =
          'Se logró obtener los datos de cambio de contraseña.';
        response.response = selectReturn;
        response.status = 201;
      } else {
        response.error = true;
        response.message =
          'No se logró obtener los datos de cambio de contraseña.';
        response.response = {
          errors: {
            confirmacion: [
              'No se logró obtener los datos de cambio de contraseña.',
            ],
          },
        };
        response.status = 422;
      }
    } catch (error) {
      response.error = true;
      response.message = 'No se pudo realizar la solicitud.';
      response.response = {
        errors: {
          confirmacion: [`${error.message}`],
        },
      };
      response.status = 422;
    }

    /* RESPUESTA */
    return response;
  }

  async selectConfirmCode(codigoid: any): Promise<IResponse> {
    const response = {
      error: true,
      message:
        'Existen problemas con el servicio de seleccionar los datos del codigo para el cambio de contraseña.',
      response: {},
      status: 500,
    };
    try {
      const selectReturn = await this.seguridadWrite
        .createQueryBuilder()
        .select()
        .from(Auth_Recover, 'rec')
        .where(`rec.id = ${codigoid}`)
        .orderBy('rec.id', 'DESC')
        .limit(1)
        .execute();
      if (selectReturn.length > 0) {
        response.error = false;
        response.message =
          'Se logró obtener los datos de cambio de contraseña.';
        response.response = selectReturn;
        response.status = 201;
      } else {
        response.error = true;
        response.message =
          'No se logró obtener los datos de cambio de contraseña.';
        response.response = {
          errors: {
            confirmacion: [
              'No se logró obtener los datos de cambio de contraseña.',
            ],
          },
        };
        response.status = 422;
      }
    } catch (error) {
      response.error = true;
      response.message = 'No se pudo realizar la solicitud.';
      response.response = {
        errors: {
          confirmacion: [`${error.message}`],
        },
      };
      response.status = 422;
    }

    return response;
  }

  async selectGlobal(): Promise<IResponse> {
    /* INICIALIZACION DE VARIABLES */
    const response = {
      error: true,
      message:
        'Existen problemas con el servicio de seleccionar los datos globales.',
      response: {},
      status: 500,
    };

    /* OPERACION */
    try {
      const selectReturn = await this.seguridadWrite
        .createQueryBuilder()
        .select()
        .from(Auth_Global, 'glo')
        .execute();

      if (selectReturn.length > 0) {
        response.error = false;
        response.message = 'Se logró obtener los datos globales.';
        response.response = selectReturn;
        response.status = 201;
      } else {
        response.error = true;
        response.message = 'No se logró obtener los datos globales.';
        response.response = {
          errors: {
            confirmacion: ['No se logró obtener los datos globales.'],
          },
        };
        response.status = 422;
      }
    } catch (error) {
      response.error = true;
      response.message = 'No se pudo realizar la solicitud.';
      response.response = {
        errors: {
          confirmacion: [`${error.message}`],
        },
      };
      response.status = 422;
    }

    /* RESPUESTA */
    return response;
  }

  async selectGlobalByCodigo(codigo: string): Promise<IResponse> {
    /* INICIALIZACION DE VARIABLES */
    const response = {
      error: true,
      message:
        'Existen problemas con el servicio de seleccionar los datos globales.',
      response: {},
      status: 500,
    };

    /* OPERACION */
    try {
      const selectReturn = await this.seguridadWrite
        .createQueryBuilder()
        .select()
        .from(Auth_Global, 'glo')
        .where(`glo.codigo =:codigo`, { codigo })
        .execute();

      if (selectReturn.length > 0) {
        response.error = false;
        response.message = 'Se logró obtener los datos globales.';
        response.response = selectReturn[0];
        response.status = 201;
      } else {
        response.error = true;
        response.message = 'No se logró obtener los datos globales.';
        response.response = {
          errors: {
            confirmacion: ['No se logró obtener los datos globales.'],
          },
        };
        response.status = 422;
      }
    } catch (error) {
      response.error = true;
      response.message = 'No se pudo realizar la solicitud.';
      response.response = {
        errors: {
          confirmacion: [`${error.message}`],
        },
      };
      response.status = 422;
    }

    /* RESPUESTA */
    return response;
  }
}
