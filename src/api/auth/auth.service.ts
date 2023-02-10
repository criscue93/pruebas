import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import * as bcrypt from 'bcrypt';
import { IResponse } from 'src/interfaces/IResponse';
import { validatePassword } from 'src/helpers/validatePass.helper';
import {
  changePasswordDTO,
  loginV2,
  permit,
  recoverDTO,
  tokenDTO,
} from './auth.dto';
import { FuncionarioQueryService } from '../funcionarios/funcionario-query.service';
import { PersonaQueryService } from '../perfil_persona/persona-query.service';
import { AplicacionQueryService } from '../aplicaciones/aplicacion-query.service';
import { SesionQueryService } from '../sesiones/sesion-query.service';
import { AuthQueryService } from './auth-query.service';
import { FuncionarioRolQueryService } from '../funcionario_rol/funcionario_rol-query.service';
import { RolPermisoQueryService } from '../rol_permiso/rol_permiso-query.service';
import { FuncionarioAplicacionQueryService } from '../funcionario_aplicacion/funcionario_aplicacion-query.service';
import { validateCiudadania } from '../../helpers/sirius.helper';

@Injectable()
export class AuthService {
  constructor(
    private readonly authQueryService: AuthQueryService,
    private readonly funcionarioQueryService: FuncionarioQueryService,
    private readonly personaQueryService: PersonaQueryService,
    private readonly aplicacionQueryService: AplicacionQueryService,
    private readonly sesionQueryService: SesionQueryService,
    private readonly funcionarioRolQueryService: FuncionarioRolQueryService,
    private readonly rolPermisoQueryService: RolPermisoQueryService,
    private readonly funcionarioAplicacionQueryService: FuncionarioAplicacionQueryService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(usuario: string, password: string): Promise<IResponse> {
    /* INICIALIZACION DE VARIABLES */
    let response = {
      error: true,
      message: 'Existen problemas con el servicio validar usuario.',
      response: {},
      status: 500,
    };

    /* OPERACION */
    const data1 = {
      where: 'usuario = :usuario',
      value: {
        usuario,
      },
    };
    response = await this.funcionarioQueryService.selectFuncionario(data1);

    if (response.error === false) {
      const user = response.response;
      const equal = await compare(
        password,
        String(user['Auth_Funcionarios_password']),
      );
      if (equal === true) {
        response.error = false;
        response.message = 'Usuario y contraseña correctos.';
        response.response = user;
        response.status = 201;
      } else {
        response.error = true;
        response.message = 'Contraseña incorrectos.';
        response.response = {
          errors: { password: ['Contraseña incorrecta.'] },
        };
        response.status = 422;
      }
    } else {
      response.error = true;
      response.message = 'Nombre de usuario incorrecto.';
      response.response = {
        errors: { usuario: ['Nombre de usuario incorrecto.'] },
      };
      response.status = 422;
    }

    /* RESPUESTA */
    return response;
  }

  async validateUserV2(usuario: string, password: string): Promise<IResponse> {
    /* INICIALIZACION DE VARIABLES */
    let response = {
      error: true,
      message: 'Existen problemas con el servicio validar usuario.',
      response: {},
      status: 500,
    };

    /* OPERACION */
    const data1 = {
      where: 'usuario = :usuario AND estado != 0',
      value: {
        usuario,
      },
    };
    response = await this.funcionarioQueryService.selectFuncionario(data1);

    if (response.error === false) {
      const user = response.response;
      const equal = await compare(
        password,
        String(user['Auth_Funcionarios_password']),
      );
      if (equal === true) {
        response.error = false;
        response.message = 'Usuario y contraseña correctos.';
        response.response = user;
        response.status = 201;
      } else {
        response.error = true;
        response.message = 'Contraseña incorrectos.';
        response.response = {
          errors: { password: ['Contraseña incorrecta.'] },
        };
        response.status = 422;
      }
    } else {
      response.error = true;
      response.message = 'Nombre de usuario incorrecto.';
      response.response = {
        errors: { usuario: ['Nombre de usuario incorrecto.'] },
      };
      response.status = 422;
    }

    /* RESPUESTA */
    return response;
  }

  async validateAplicacion(
    app: string,
    user: string,
    pass: string,
  ): Promise<IResponse> {
    /* INICIALIZACION DE VARIABLES */
    let response = {
      error: true,
      message: 'Existen problemas con el servicio validar aplicación.',
      response: null,
      status: 500,
    };

    /* OPERACION */
    const data1 = {
      where: 'codigo = :codigo',
      value: {
        codigo: app,
      },
    };
    response = await this.aplicacionQueryService.selectAplicacion(data1);

    const idAplicacion = response.response.Auth_Aplicaciones_id;

    response = await this.validateUser(user, pass);
    const idFuncionario = response.response.Auth_Funcionarios_id;

    response =
      await this.funcionarioAplicacionQueryService.selectFuncionarioAppStatus(
        idFuncionario,
        idAplicacion,
      );

    if (response.error === true) {
      response.message = 'No tiene acceso a la aplicación.';
      response.response = {
        errors: {
          aplicacion: 'No tiene acceso a la aplicación.',
        },
      };
    }

    /* RESPUESTA */
    return response;
  }

  async validateAplicacionV2(
    app: string,
    user: string,
    pass: string,
  ): Promise<IResponse> {
    /* INICIALIZACION DE VARIABLES */
    let response = {
      error: true,
      message: 'Existen problemas con el servicio validar aplicación.',
      response: {},
      status: 500,
    };

    /* OPERACION */
    const data1 = {
      where: 'codigo = :codigo',
      value: {
        codigo: app,
      },
    };

    response = await this.validateUser(user, pass);

    response = await this.aplicacionQueryService.selectAplicacion(data1);

    const idAplicacion = response.response['Auth_Aplicaciones_id'];

    response = await this.validateUser(user, pass);

    const idFuncionario = response.response['Auth_Funcionarios_id'];

    response =
      await this.funcionarioAplicacionQueryService.selectFuncionarioAppStatus(
        idFuncionario,
        idAplicacion,
      );
    if (response.error === true) {
      response.message = 'No tiene acceso a la aplicación.';
      response.response = {
        errors: {
          aplicacion: 'No tiene acceso a la aplicación.',
        },
      };
    }

    /* RESPUESTA */
    return response;
  }

  async validateAplicacionV3(app: number, ci: string): Promise<IResponse> {
    /* INICIALIZACION DE VARIABLES */
    let response = {
      error: true,
      message: 'Existen problemas con el servicio validar aplicación.',
      response: null,
      status: 500,
    };

    /* OPERACION */
    const data1 = {
      where: 'id = :id',
      value: { id: app },
    };
    const aplicacion = await this.aplicacionQueryService.selectAplicacion(
      data1,
    );

    const data2 = {
      where: 'per.ci = :ci',
      value: { ci },
    };
    const funcionario =
      await this.funcionarioQueryService.selectFuncionarioPerfilV2(data2);

    response =
      await this.funcionarioAplicacionQueryService.selectFuncionarioAppStatus(
        funcionario.response.funcionarioId,
        aplicacion.response.Auth_Aplicaciones_id,
      );

    if (response.error === true) {
      response.message = 'No tiene acceso a la aplicación.';
      response.response = {
        errors: {
          aplicacion: 'No tiene acceso a la aplicación.',
        },
      };
    } else {
      response.response = {
        aplicacion: aplicacion.response,
        funcionario: response.response,
      };
    }

    /* RESPUESTA */
    return response;
  }

  async countAplicacion(codigo: string): Promise<IResponse> {
    /* INICIALIZACION DE VARIABLES */
    let response = {
      error: true,
      message: 'Existen problemas con el servicio validar aplicación.',
      response: {},
      status: 500,
    };

    /* OPERACION */
    const data1 = {
      where: 'codigo = :codigo',
      value: {
        codigo,
      },
    };
    response = await this.aplicacionQueryService.selectAplicacion(data1);

    /* RESPUESTA */
    return response;
  }

  async login(data: any, origen: any): Promise<IResponse> {
    /* INICIALIZACION DE VARIABLES */
    let response = {
      error: true,
      message: 'Existen problemas con el servicio login de usuario.',
      response: null,
      status: 500,
    };

    /* OPERACION */
    response = await this.validateAplicacion(
      data.aplicacion,
      data.usuario,
      data.password,
    );

    if (response.error === false) {
      response = await this.validateUser(data.usuario, data.password);

      if (response.error === false) {
        const dataAplicacion = await this.countAplicacion(data.aplicacion);

        const dataFuncionario = [];
        dataFuncionario.push(response.response);

        response =
          await this.funcionarioAplicacionQueryService.selectFuncionarioAplicacionStatus(
            dataFuncionario[0].Auth_Funcionarios_id,
            dataAplicacion.response.Auth_Aplicaciones_id,
          );
        response = await this.sesionQueryService.selectSesiones(
          response.response[0].id,
        );

        const cantidad = response.response.length;

        if (
          dataAplicacion.response.Auth_Aplicaciones_cantidadSesiones <= cantidad
        ) {
          const aplicacion = dataAplicacion.response.Auth_Aplicaciones_nombre;
          response.error = false;
          response.message = 'Login incorrecto.';
          response.response = {
            errors: {
              sessions: `Supero la cantidad de sesiones permitidas para la aplicacion ${aplicacion}.`,
            },
          };
          response.status = 423;
        } else {
          const codigoDoble = 'dobleAutenticacion';
          const global = await this.authQueryService.selectGlobalByCodigo(
            codigoDoble,
          );

          if (global.response.estado === 0) {
            const hash = '';

            response = await this.dataToken(
              dataFuncionario[0].Auth_Funcionarios_id,
              dataAplicacion.response.Auth_Aplicaciones_id,
              hash,
              origen,
            );
          } else {
            const dataRoles =
              await this.funcionarioRolQueryService.selectFuncionarioRol3(
                dataFuncionario[0].Auth_Funcionarios_id,
                dataAplicacion.response.Auth_Aplicaciones_id,
              );

            let condi = 0;
            const arrayDoble = [];
            while (dataRoles.response[condi] != undefined) {
              if (
                dataRoles.response[condi]['Auth_Roles_dobleAutenticacion'] === 0
              ) {
                arrayDoble.push(true);
              }
              condi++;
            }

            const resultado = arrayDoble.find(() => true);
            if (resultado) {
              const hash = '';

              response = await this.dataToken(
                dataFuncionario[0].Auth_Funcionarios_id,
                dataAplicacion.response.Auth_Aplicaciones_id,
                hash,
                origen,
              );
            } else if (
              dataFuncionario[0].Auth_Funcionarios_dobleAutenticacion === 0
            ) {
              const hash = '';

              response = await this.dataToken(
                dataFuncionario[0].Auth_Funcionarios_id,
                dataAplicacion.response.Auth_Aplicaciones_id,
                hash,
                origen,
              );
            } else {
              const data1 = {
                where: 'id = :id',
                value: {
                  id: dataFuncionario[0].Auth_Funcionarios_perfilPersonaId,
                },
              };
              response = await this.personaQueryService.selectPersona(data1);
              const dataPersona = [];
              dataPersona.push(response.response);

              const min = 100000;
              const max = 999999;
              const codeConfirmation =
                Math.floor(Math.random() * (max - min)) + min;
              const numero = `591${dataPersona[0].Auth_Perfil_Persona_celular}`;
              const sms = `*${dataAplicacion.response.Auth_Aplicaciones_nombre}* \n\n Buenos días _${dataPersona[0].Auth_Perfil_Persona_nombre}_ \n 🔑 Este es tu código para ingresar al sistema: *${codeConfirmation}* \n ⏰ El tiempo de validez del código es: *${process.env.TIME_CODE_AUTENTICATION} min* \n\n ✅ https://jl.fiscalia.gob.bo \n ᴶᴸ ⁻ ⱽ¹ ⁻ ᴹᴵᴺᴵˢᵀᴱᴿᴵᴼ ᴾᵁᴮᴸᴵᶜᴼ`;

              response.response = smsWhatsapp(
                numero,
                sms,
                dataAplicacion.response.Auth_Aplicaciones_nombre,
              );

              interface dataUser {
                funcionarioId: number;
                aplicacionId: number;
              }
              const valida: dataUser = {
                funcionarioId: dataFuncionario[0].Auth_Funcionarios_id,
                aplicacionId: dataAplicacion.response.Auth_Aplicaciones_id,
              };

              response = await this.authQueryService.insertConfirmacion(
                dataFuncionario[0].Auth_Funcionarios_id,
                dataAplicacion.response.Auth_Aplicaciones_id,
                codeConfirmation,
              );

              response.error = false;
              response.message = 'Código enviado correctamente.';
              response.response = [valida];
              response.status = 201;
            }
          }
        }
      } else {
        response.error = true;
        response.message = 'Login incorrecto.';
        response.response = {
          errors: {
            usuario: ['Datos incorrectos.'],
          },
        };
        response.status = 422;
      }
    }

    /* RESPUESTA */
    return response;
  }

  async loginV2(data: loginV2, origen: any): Promise<IResponse> {
    /* INICIALIZACION DE VARIABLES */
    let response = {
      error: true,
      message: 'Existen problemas con el servicio login de usuario.',
      response: {},
      status: 500,
    };

    /* OPERACION */
    response = await this.validateAplicacion(
      process.env.APP_LOGIN_CODE,
      data.usuario,
      data.password,
    );

    if (response.error === false) {
      response = await this.validateUserV2(data.usuario, data.password);

      if (response.error === false) {
        const dataAplicacion = await this.countAplicacion(
          process.env.APP_LOGIN_CODE,
        );
        const dataFuncionario = [];
        dataFuncionario.push(response.response);

        response =
          await this.funcionarioAplicacionQueryService.selectFuncionarioAplicacionStatus(
            dataFuncionario[0].Auth_Funcionarios_id,
            dataAplicacion.response.Auth_Aplicaciones_id,
          );
        response = await this.sesionQueryService.selectSesiones(
          response.response[0].id,
        );

        const activeSesiones = response.response;
        let cantidad = 0;
        while (activeSesiones[cantidad] != undefined) {
          cantidad++;
        }

        if (
          dataAplicacion.response.Auth_Aplicaciones_cantidadSesiones <= cantidad
        ) {
          const aplicacion = dataAplicacion.response.Auth_Aplicaciones_nombre;
          response.error = false;
          response.message = 'Login incorrecto.';
          response.response = {
            errors: {
              sessions: `Supero la cantidad de sesiones permitidas para la aplicacion ${aplicacion}.`,
            },
          };
          response.status = 423;
        } else {
          const codigoDoble = 'dobleAutenticacion';
          const global = await this.authQueryService.selectGlobalByCodigo(
            codigoDoble,
          );

          if (global.response['estado'] === 0) {
            const hash = '';

            response = await this.dataTokenNew(
              dataFuncionario[0].Auth_Funcionarios_id,
              dataAplicacion.response.Auth_Aplicaciones_id,
              hash,
              origen,
            );
          } else {
            const dataRoles =
              await this.funcionarioRolQueryService.selectFuncionarioRol3(
                dataFuncionario[0].Auth_Funcionarios_id,
                dataAplicacion.response.Auth_Aplicaciones_id,
              );

            let condi = 0;
            const arrayDoble = [];
            while (dataRoles.response[condi] != undefined) {
              if (
                dataRoles.response[condi]['Auth_Roles_dobleAutenticacion'] === 0
              ) {
                arrayDoble.push(true);
              }
              condi++;
            }

            const resultado = arrayDoble.find(() => true);
            if (resultado) {
              const hash = '';

              response = await this.dataTokenNew(
                dataFuncionario[0].Auth_Funcionarios_id,
                dataAplicacion.response.Auth_Aplicaciones_id,
                hash,
                origen,
              );
            } else if (
              dataFuncionario[0].Auth_Funcionarios_dobleAutenticacion === 0
            ) {
              const hash = '';

              response = await this.dataTokenNew(
                dataFuncionario[0].Auth_Funcionarios_id,
                dataAplicacion.response.Auth_Aplicaciones_id,
                hash,
                origen,
              );
            } else {
              const data1 = {
                where: 'id = :id',
                value: {
                  id: dataFuncionario[0].Auth_Funcionarios_perfilPersonaId,
                },
              };
              response = await this.personaQueryService.selectPersona(data1);
              const dataPersona = [];
              dataPersona.push(response.response);

              const min = 100000;
              const max = 999999;
              const codeConfirmation =
                Math.floor(Math.random() * (max - min)) + min;
              const numero = `591${dataPersona[0].Auth_Perfil_Persona_celular}`;
              const sms = `*${dataAplicacion.response.Auth_Aplicaciones_nombre}* \n\n Buenos días _${dataPersona[0].Auth_Perfil_Persona_nombre}_ \n 🔑 Este es tu código para ingresar al sistema: *${codeConfirmation}* \n ⏰ El tiempo de validez del código es: *${process.env.TIME_CODE_AUTENTICATION} min* \n\n ✅ https://jl.fiscalia.gob.bo \n ᴶᴸ ⁻ ⱽ¹ ⁻ ᴹᴵᴺᴵˢᵀᴱᴿᴵᴼ ᴾᵁᴮᴸᴵᶜᴼ`;

              response.response = smsWhatsapp(
                numero,
                sms,
                dataAplicacion.response.Auth_Aplicaciones_nombre,
              );

              interface dataUser {
                funcionarioId: number;
                aplicacionId: number;
              }
              const valida: dataUser = {
                funcionarioId: dataFuncionario[0].Auth_Funcionarios_id,
                aplicacionId: dataAplicacion.response.Auth_Aplicaciones_id,
              };

              response = await this.authQueryService.insertConfirmacion(
                dataFuncionario[0].Auth_Funcionarios_id,
                dataAplicacion.response.Auth_Aplicaciones_id,
                codeConfirmation,
              );

              response.error = false;
              response.message = 'Código enviado correctamente.';
              response.response = [valida];
              response.status = 201;
            }
          }
        }
      } else {
        response.error = true;
        response.message = 'Login incorrecto.';
        response.response = {
          errors: {
            usuario: ['Datos incorrectos.'],
          },
        };
        response.status = 422;
      }
    }

    /* RESPUESTA */
    return response;
  }

  async loginV3(data: any, origen: any): Promise<IResponse> {
    /* INICIALIZACION DE VARIABLES */
    let response = {
      error: true,
      message: 'Existen problemas con el servicio login de usuario.',
      response: null,
      status: 500,
    };

    /* OPERACION */
    const validateData = await this.validateAplicacionV3(
      data.aplicacionId,
      data.numeroDocumento,
    );

    if (validateData.error === false) {
      response =
        await this.funcionarioAplicacionQueryService.selectFuncionarioAplicacionStatus(
          validateData.response['funcionario'].funcionarioId,
          validateData.response['aplicacion'].Auth_Aplicaciones_id,
        );

      response = await this.sesionQueryService.selectSesiones(
        response.response[0].id,
      );

      const cantidad = response.response.length;
      if (
        validateData.response['aplicacion']
          .Auth_Aplicaciones_cantidadSesiones >= cantidad
      ) {
        response = await this.dataTokenV3(
          validateData.response['funcionario'].funcionarioId,
          validateData.response['aplicacion'].Auth_Aplicaciones_id,
          '',
          origen,
        );
      } else {
        response.error = true;
        response.message = 'Login incorrecto.';
        response.response = {
          errors: {
            sessions: `Supero la cantidad de sesiones permitidas para la aplicacion ${validateData.response['aplicacion'].Auth_Aplicaciones_nombre}.`,
          },
        };
        response.status = 422;
      }
    } else {
      response.error = true;
      response.message = 'Login incorrecto.';
      response.response = {
        errors: {
          aplicacion: `No tiene acceso a la aplicacion ${data.aplicacionId}.`,
        },
      };
      response.status = 422;
    }

    /* RESPUESTA */
    return response;
  }

  async loginCiudadania(data: any, origen: any): Promise<IResponse> {
    /* INICIALIZACION DE VARIABLES */
    let response = {
      error: true,
      message: 'Existen problemas con el servicio validar usuario.',
      response: {},
      status: 500,
    };

    /* OPERACION */
    response = await validateCiudadania(data.binnacleId);

    if (response.error === false) {
      const ciPersona =
        response.response['ciudadanoDigital']['documento_identidad'][
          'numero_documento'
        ];

      const data1 = {
        where: 'ci = :ci',
        value: {
          ci: ciPersona,
        },
      };
      response = await this.personaQueryService.selectPersona(data1);

      if (response.error === false) {
        const data1 = {
          where: 'perfilPersonaId = :perfilPersonaId',
          value: {
            perfilPersonaId: response.response['Auth_Perfil_Persona_id'],
          },
        };
        response = await this.funcionarioQueryService.selectFuncionario(data1);

        const dataAplicacion = await this.countAplicacion(data.aplicacion);
        const dataFuncionario = [];
        dataFuncionario.push(response.response);

        response =
          await this.funcionarioAplicacionQueryService.selectFuncionarioAplicacionStatus(
            dataFuncionario[0].Auth_Funcionarios_id,
            dataAplicacion.response.Auth_Aplicaciones_id,
          );

        if (response.error === false) {
          response = await this.sesionQueryService.selectSesiones(
            response.response[0].id,
          );

          const activeSesiones = response.response;
          let cantidad = 0;
          while (activeSesiones[cantidad] != undefined) {
            cantidad++;
          }

          if (
            dataAplicacion.response.Auth_Aplicaciones_cantidadSesiones <=
            cantidad
          ) {
            const aplicacion = dataAplicacion.response.Auth_Aplicaciones_nombre;
            response.error = false;
            response.message = 'Login incorrecto.';
            response.response = {
              errors: {
                sessions: `Supero la cantidad de sesiones permitidas para la aplicacion ${aplicacion}.`,
              },
            };
            response.status = 423;
          } else {
            const hash = '';

            response = await this.dataToken(
              dataFuncionario[0].Auth_Funcionarios_id,
              dataAplicacion.response.Auth_Aplicaciones_id,
              hash,
              origen,
            );
          }
        } else {
          response.message = 'El funcionario no tiene acceso a la aplicación.';
          response.response = {
            errors: {
              funcionario: ['El funcionario no tiene acceso a la aplicación.'],
            },
          };
        }
      } else {
        response.message = 'El funcionario no esta registrado.';
        response.response = {
          errors: {
            funcionario: ['El funcionario no esta registrado.'],
          },
        };
      }
    } else {
      response.response = {
        errors: {
          binnacle: ['El binnacleId es incorrecto.'],
        },
      };
      response.status = 422;
    }

    /* RESPUESTA */
    return response;
  }

  async loginToken(
    funcionarioId: any,
    aplicacionId: any,
    origen: any,
  ): Promise<IResponse> {
    /* INICIALIZACION DE VARIABLES */
    let response = {
      error: true,
      message: 'Existen problemas con el servicio validar usuario.',
      response: {},
      status: 500,
    };

    /* OPERACION */

    const data1 = {
      where: 'id = :id',
      value: {
        id: aplicacionId,
      },
    };
    response = await this.aplicacionQueryService.selectAplicacion(data1);

    if (response.error === false) {
      const hash = '';
      response = await this.dataToken(
        funcionarioId,
        aplicacionId,
        hash,
        origen,
      );
    } else {
      response.message = 'El funcionario no tiene acceso a la aplicación.';
      response.response = {
        errors: {
          funcionario: ['El funcionario no tiene acceso a la aplicación.'],
        },
      };
    }

    /* RESPUESTA */
    return response;
  }

  async dataToken(
    funcionarioId: any,
    aplicacionId: any,
    hash: any,
    origen: any,
  ): Promise<IResponse> {
    /* INICIALIZACION DE VARIABLES */
    let response = {
      error: true,
      message: 'Existen problemas con el servicio obtener los datos de login.',
      response: {},
      status: 500,
    };

    /* OPERACION */
    const dataFuncionario = await this.funcionarioQueryService.viewFuncionario(
      funcionarioId,
    );

    const dataInstitucion =
      await this.funcionarioQueryService.selectInstitucion(funcionarioId);

    const dataCargo = await this.funcionarioQueryService.selectCargo(
      funcionarioId,
    );

    let cargoNombre = '';
    if (dataCargo.response != undefined) {
      cargoNombre = dataCargo.response['nombreCargo'];
    }

    const payload = {
      sub: [
        { idFuncionario: funcionarioId },
        { idPersona: dataFuncionario.response[0].id },
        { idAplicacion: aplicacionId },
        { ci: dataFuncionario.response[0].ci },
      ],
    };

    const data1 = {
      where: 'id = :id',
      value: {
        id: aplicacionId,
      },
    };
    const dataApp = await this.aplicacionQueryService.selectAplicacion(data1);
    const tiempoToken = dataApp.response['Auth_Aplicaciones_tiempoToken'];

    const token = await this.jwtService.sign(payload, {
      expiresIn: `${tiempoToken}s`,
    });

    interface UserData {
      id: number;
      nombre: string;
      paterno: string;
      materno: string;
      ci: number;
      nombreCompleto: string;
      domicilio: string;
      sexo: string;
      email: string;
      celular: number;
      cargo: string;
      idFoto: number;
      institucionId: number;
      rutaLogo: string;
      nombreLogo: string;
      colorMenu: string;
      textoMenu: string;
      colorPrimario: string;
      fotoRuta: string;
      aplicacionId: number;
      departamentoId: number;
      entidadId: number;
      municipioId: number;
      oficinaId: number;
      divisionId: number;
      esJefeUnidad: number;
    }
    const user = [];
    const valida: UserData = {
      id: funcionarioId,
      nombre: dataFuncionario.response[0].nombre,
      paterno: dataFuncionario.response[0].paterno,
      materno: dataFuncionario.response[0].materno,
      ci: dataFuncionario.response[0].ci,
      celular: dataFuncionario.response[0].celular,
      fotoRuta: dataFuncionario.response[0].fotoRuta,
      cargo: cargoNombre,
      idFoto: dataFuncionario.response[0].idFoto,
      institucionId: dataInstitucion.response[0].institucionId,
      rutaLogo: dataInstitucion.response[0].rutaLogo,
      nombreLogo: dataInstitucion.response[0].nombreLogo,
      colorMenu: dataInstitucion.response[0].colorMenu,
      textoMenu: dataInstitucion.response[0].textoMenu,
      colorPrimario: dataInstitucion.response[0].colorPrimario,
      nombreCompleto: dataFuncionario.response[0].nombreCompleto,
      domicilio: dataFuncionario.response[0].direccion,
      sexo: dataFuncionario.response[0].sexo,
      email: dataFuncionario.response[0].email,
      aplicacionId: aplicacionId,

      departamentoId: dataFuncionario.response[0].departamentoId,
      entidadId: dataFuncionario.response[0].entidadId,
      municipioId: dataFuncionario.response[0].municipioId,
      oficinaId: dataFuncionario.response[0].oficinaId,
      divisionId: dataFuncionario.response[0].divisionId,
      esJefeUnidad: Number(dataFuncionario.response[0].esJefeUnidad),
    };
    user.push(valida);

    const expToken = await this.jwtService.decode(token);
    const iat = expToken['iat'];
    const exp = expToken['exp'];
    interface SesionData {
      funcionarioId: number;
      aplicacionId: number;
      token: string;
    }

    const sesion: SesionData = {
      funcionarioId: funcionarioId,
      aplicacionId: aplicacionId,
      token: token,
    };

    if (hash === '') {
      response = await this.sesionQueryService.insertSesion(
        sesion,
        funcionarioId,
      );

      const data1 = {
        where: 'id = :id',
        value: {
          id: aplicacionId,
        },
      };
      response = await this.aplicacionQueryService.selectAplicacion(data1);
      const dataAplicacion = response.response;
      const codigo = 0;

      const logs = {
        funcionario: dataFuncionario.response[0].nombreCompleto,
        ci: dataFuncionario.response[0].ci,
        aplicacion: dataAplicacion['Auth_Aplicaciones_codigo'],
        codigo,
        origen: {
          ip: origen['ip'],
          userAgent: origen['userAgent'],
        },
      };

      const logSesion = new this.sesionesDocument(logs);
      await logSesion.save();
    }

    const dataRoles =
      await this.funcionarioRolQueryService.selectFuncionarioRol2(
        funcionarioId,
      );

    let condi1 = 0;
    let condi3 = 0;
    const roles = [];
    const listPermiso = [];
    while (dataRoles.response[condi1] != undefined) {
      roles.push(dataRoles.response[condi1].Auth_Roles_nombre);
      const dataPermisos =
        await this.rolPermisoQueryService.selectRolPermisoStatus2(
          dataRoles.response[condi1].Auth_Roles_id,
        );

      if (dataPermisos.error === false) {
        while (dataPermisos.response.length > condi3) {
          listPermiso.push(dataPermisos.response[condi3]);
          condi3++;
        }
      }
      condi3 = 0;
      condi1++;
    }

    let condi2 = 0;
    const permisos = [];
    while (listPermiso[condi2] != undefined) {
      permisos.push(listPermiso[condi2].Auth_Permisos_nombre);
      condi2++;
    }

    const funAppData =
      await this.funcionarioAplicacionQueryService.selectFuncionarioAplicacionData(
        funcionarioId,
      );

    interface dataAppFun {
      aplicacionId: number;
      nombreAplicacion: string;
      url: string;
    }
    let condi5 = 0;
    const apps = [];
    while (funAppData.response[condi5] != undefined) {
      const valida: dataAppFun = {
        aplicacionId: funAppData.response[condi5]['aplicacionId'],
        nombreAplicacion: funAppData.response[condi5]['nombreAplicacion'],
        url: funAppData.response[condi5]['url'],
      };
      apps.push(valida);
      condi5++;
    }

    response.error = false;
    response.message = 'Login correcto.';
    response.response = {
      user,
      apps,
      roles,
      permisos,
      token,
      iat,
      exp,
    };
    response.status = 201;

    /* RESPUESTA */
    return response;
  }

  async dataTokenV3(
    funcionarioId: any,
    aplicacionId: any,
    hash: any,
    origen: any,
  ): Promise<IResponse> {
    /* INICIALIZACION DE VARIABLES */
    let response = {
      error: true,
      message: 'Existen problemas con el servicio obtener los datos de login.',
      response: {},
      status: 500,
    };

    /* OPERACION */
    const dataFuncionario = await this.funcionarioQueryService.viewFuncionario(
      funcionarioId,
    );

    const dataInstitucion =
      await this.funcionarioQueryService.selectInstitucion(funcionarioId);

    const dataCargo = await this.funcionarioQueryService.selectCargo(
      funcionarioId,
    );

    let cargoNombre = '';
    if (dataCargo.response != undefined) {
      cargoNombre = dataCargo.response['nombreCargo'];
    }

    const payload = {
      sub: [
        { idFuncionario: funcionarioId },
        { idPersona: dataFuncionario.response[0].id },
        { idAplicacion: aplicacionId },
        { ci: dataFuncionario.response[0].ci },
      ],
    };

    const data1 = {
      where: 'id = :id',
      value: {
        id: aplicacionId,
      },
    };
    const dataApp = await this.aplicacionQueryService.selectAplicacion(data1);
    const tiempoToken = dataApp.response['Auth_Aplicaciones_tiempoToken'];

    const token = await this.jwtService.sign(payload, {
      expiresIn: `${tiempoToken}s`,
    });

    interface UserData {
      id: number;
      nombre: string;
      paterno: string;
      materno: string;
      ci: number;
      nombreCompleto: string;
      domicilio: string;
      sexo: string;
      email: string;
      celular: number;
      cargo: string;
      idFoto: number;
      institucionId: number;
      rutaLogo: string;
      nombreLogo: string;
      colorMenu: string;
      textoMenu: string;
      colorPrimario: string;
      fotoRuta: string;
      aplicacionId: number;
      departamentoId: number;
      entidadId: number;
      municipioId: number;
      oficinaId: number;
      divisionId: number;
      esJefeUnidad: number;
    }
    const user = [];
    const valida: UserData = {
      id: funcionarioId,
      nombre: dataFuncionario.response[0].nombre,
      paterno: dataFuncionario.response[0].paterno,
      materno: dataFuncionario.response[0].materno,
      ci: dataFuncionario.response[0].ci,
      celular: dataFuncionario.response[0].celular,
      fotoRuta: dataFuncionario.response[0].fotoRuta,
      cargo: cargoNombre,
      idFoto: dataFuncionario.response[0].idFoto,
      institucionId: dataInstitucion.response[0].institucionId,
      rutaLogo: dataInstitucion.response[0].rutaLogo,
      nombreLogo: dataInstitucion.response[0].nombreLogo,
      colorMenu: dataInstitucion.response[0].colorMenu,
      textoMenu: dataInstitucion.response[0].textoMenu,
      colorPrimario: dataInstitucion.response[0].colorPrimario,
      nombreCompleto: dataFuncionario.response[0].nombreCompleto,
      domicilio: dataFuncionario.response[0].direccion,
      sexo: dataFuncionario.response[0].sexo,
      email: dataFuncionario.response[0].email,
      aplicacionId: aplicacionId,

      departamentoId: dataFuncionario.response[0].departamentoId,
      entidadId: dataFuncionario.response[0].entidadId,
      municipioId: dataFuncionario.response[0].municipioId,
      oficinaId: dataFuncionario.response[0].oficinaId,
      divisionId: dataFuncionario.response[0].divisionId,
      esJefeUnidad: Number(dataFuncionario.response[0].esJefeUnidad),
    };
    user.push(valida);

    const expToken = await this.jwtService.decode(token);
    const iat = expToken['iat'];
    const exp = expToken['exp'];
    interface SesionData {
      funcionarioId: number;
      aplicacionId: number;
      token: string;
    }

    const sesion: SesionData = {
      funcionarioId: funcionarioId,
      aplicacionId: aplicacionId,
      token: token,
    };

    if (hash === '') {
      response = await this.sesionQueryService.insertSesion(
        sesion,
        funcionarioId,
      );

      const data1 = {
        where: 'id = :id',
        value: {
          id: aplicacionId,
        },
      };
      response = await this.aplicacionQueryService.selectAplicacion(data1);
      const dataAplicacion = response.response;
      const codigo = 0;

      const logs = {
        funcionario: dataFuncionario.response[0].nombreCompleto,
        ci: dataFuncionario.response[0].ci,
        aplicacion: dataAplicacion['Auth_Aplicaciones_codigo'],
        codigo,
        origen: {
          ip: origen['ip'],
          userAgent: origen['userAgent'],
        },
      };

      const logSesion = new this.sesionesDocument(logs);
      await logSesion.save();
    }

    const dataRoles =
      await this.funcionarioRolQueryService.selectFuncionarioRol2(
        funcionarioId,
      );

    let condi1 = 0;
    let condi3 = 0;
    const roles = [];
    const listPermiso = [];
    while (dataRoles.response[condi1] != undefined) {
      roles.push(dataRoles.response[condi1].Auth_Roles_nombre);
      const dataPermisos =
        await this.rolPermisoQueryService.selectRolPermisoStatus2(
          dataRoles.response[condi1].Auth_Roles_id,
        );

      if (dataPermisos.error === false) {
        while (dataPermisos.response.length > condi3) {
          listPermiso.push(dataPermisos.response[condi3]);
          condi3++;
        }
      }
      condi3 = 0;
      condi1++;
    }

    let condi2 = 0;
    const permisos = [];
    while (listPermiso[condi2] != undefined) {
      permisos.push(listPermiso[condi2].Auth_Permisos_nombre);
      condi2++;
    }

    const funAppData =
      await this.funcionarioAplicacionQueryService.selectFuncionarioAplicacionDataV2(
        funcionarioId,
        aplicacionId,
      );

    response.error = false;
    response.message = 'Login correcto.';
    response.response = {
      user,
      apps: {
        aplicacionId: funAppData.response[0]['aplicacionId'],
        nombreAplicacion: funAppData.response[0]['nombreAplicacion'],
        url: funAppData.response[0]['url'],
      },
      roles,
      permisos,
      token,
      iat,
      exp,
    };
    response.status = 201;

    /* RESPUESTA */
    return response;
  }

  async dataTokenNew(
    funcionarioId: any,
    aplicacionId: any,
    hash: any,
    origen: any,
  ): Promise<IResponse> {
    /* INICIALIZACION DE VARIABLES */
    let response = {
      error: true,
      message: 'Existen problemas con el servicio obtener los datos de login.',
      response: {},
      status: 500,
    };

    /* OPERACION */
    response = await this.funcionarioQueryService.viewFuncionario(
      funcionarioId,
    );
    const dataFuncionario = response.response;
    response = await this.funcionarioQueryService.selectInstitucion(
      funcionarioId,
    );
    const dataInstitucion = response.response;

    response = await this.funcionarioQueryService.selectCargo(funcionarioId);
    const dataCargo = response.response;

    let cargoNombre = '';
    if (dataCargo != undefined) {
      cargoNombre = dataCargo['nombreCargo'];
    }

    const payload = {
      sub: [
        { idFuncionario: funcionarioId },
        { idPersona: dataFuncionario[0].id },
        { idAplicacion: aplicacionId },
        { ci: dataFuncionario[0].ci },
      ],
    };

    const data1 = {
      where: 'id = :id',
      value: {
        id: aplicacionId,
      },
    };
    const dataApp = await this.aplicacionQueryService.selectAplicacion(data1);
    const tiempoToken = dataApp.response['Auth_Aplicaciones_tiempoToken'];

    const token = await this.jwtService.sign(payload, {
      expiresIn: `${tiempoToken}s`,
    });

    interface UserData {
      id: number;
      nombre: string;
      paterno: string;
      materno: string;
      nombreCompleto: string;
      ci: number;
      celular: number;
      domicilio: string;
      sexo: string;
      email: string;
      cargo: string;
      idFoto: number;
      institucionId: number;
      rutaLogo: string;
      nombreLogo: string;
      colorMenu: string;
      textoMenu: string;
      colorPrimario: string;
      fotoRuta: string;
      aplicacionId: number;
      departamentoId: number;
      entidadId: number;
      municipioId: number;
      oficinaId: number;
      divisionId: number;
      esJefeUnidad: number;
    }
    const user = [];
    const valida: UserData = {
      id: funcionarioId,
      nombre: dataFuncionario[0].nombre,
      paterno: dataFuncionario[0].paterno,
      materno: dataFuncionario[0].materno,
      ci: dataFuncionario[0].ci,
      celular: dataFuncionario[0].celular,
      fotoRuta: dataFuncionario[0].fotoRuta,
      cargo: cargoNombre,
      idFoto: dataFuncionario[0].idFoto,
      institucionId: dataInstitucion[0].institucionId,
      rutaLogo: dataInstitucion[0].rutaLogo,
      nombreLogo: dataInstitucion[0].nombreLogo,
      colorMenu: dataInstitucion[0].colorMenu,
      textoMenu: dataInstitucion[0].textoMenu,
      colorPrimario: dataInstitucion[0].colorPrimario,
      nombreCompleto: dataFuncionario[0].nombreCompleto,
      domicilio: dataFuncionario[0].direccion,
      sexo: dataFuncionario[0].sexo,
      email: dataFuncionario[0].email,

      aplicacionId: aplicacionId,

      departamentoId: dataFuncionario[0].departamentoId,
      entidadId: dataFuncionario[0].entidadId,
      municipioId: dataFuncionario[0].municipioId,
      oficinaId: dataFuncionario[0].oficinaId,
      divisionId: dataFuncionario[0].divisionId,
      esJefeUnidad: dataFuncionario[0].esJefeUnidad,
    };
    user.push(valida);

    const expToken = await this.jwtService.decode(token);
    const iat = expToken['iat'];
    const exp = expToken['exp'];
    interface SesionData {
      funcionarioId: number;
      aplicacionId: number;
      token: string;
    }

    const sesion: SesionData = {
      funcionarioId: funcionarioId,
      aplicacionId: aplicacionId,
      token: token,
    };

    if (hash === '') {
      response = await this.sesionQueryService.insertSesion(
        sesion,
        funcionarioId,
      );

      const data1 = {
        where: 'id = :id',
        value: {
          id: aplicacionId,
        },
      };
      response = await this.aplicacionQueryService.selectAplicacion(data1);
      const dataAplicacion = response.response;
      const codigo = 0;
      const nameFuncionario = `${dataFuncionario[0].nombre} ${dataFuncionario[0].paterno} ${dataFuncionario[0].materno}`;

      const logs = {
        funcionario: nameFuncionario,
        ci: dataFuncionario[0].ci,
        aplicacion: dataAplicacion['Auth_Aplicaciones_codigo'],
        codigo,
        origen: {
          ip: origen['ip'],
          userAgent: origen['userAgent'],
        },
      };

      const logSesion = new this.sesionesDocument(logs);
      await logSesion.save();
    }

    const dataRoles =
      await this.funcionarioRolQueryService.selectFuncionarioRol2(
        funcionarioId,
      );

    let condi1 = 0;
    let condi3 = 0;
    const roles = [];
    const listPermiso = [];
    while (dataRoles.response[condi1] != undefined) {
      roles.push(dataRoles.response[condi1].Auth_Roles_nombre);
      const dataPermisos =
        await this.rolPermisoQueryService.selectRolPermisoStatus2(
          dataRoles.response[condi1].Auth_Roles_id,
        );

      if (dataPermisos.error === false) {
        while (dataPermisos.response.length > condi3) {
          listPermiso.push(dataPermisos.response[condi3]);
          condi3++;
        }
      }
      condi3 = 0;
      condi1++;
    }

    let condi2 = 0;
    const permisos = [];
    while (listPermiso[condi2] != undefined) {
      permisos.push(listPermiso[condi2].Auth_Permisos_nombre);
      condi2++;
    }

    const funAppData =
      await this.funcionarioAplicacionQueryService.selectFuncionarioAplicacionData(
        funcionarioId,
      );

    interface dataAppFun {
      aplicacionId: number;
      nombreAplicacion: string;
      url: string;
    }
    let condi5 = 0;
    const apps = [];

    while (funAppData.response[condi5] != undefined) {
      const payloadApp = {
        sub: [
          { idAplicacion: funAppData.response[condi5].aplicacionId },
          { idFuncionario: funcionarioId },
          { idPersona: dataFuncionario[0].id },
          { ci: dataFuncionario[0].ci },
        ],
      };
      const token = await this.jwtService.sign(payloadApp, {
        expiresIn: `${funAppData.response[condi5].tiempoToken}s`,
      });
      const valida: dataAppFun = {
        aplicacionId: funAppData.response[condi5]['aplicacionId'],
        nombreAplicacion: funAppData.response[condi5]['nombreAplicacion'],
        url: `${funAppData.response[condi5]['url']}login/token=${token}`,
      };
      apps.push(valida);
      condi5++;
    }

    response.error = false;
    response.message = 'Login correcto.';
    response.response = {
      user,
      apps,
      roles,
      permisos,
      token,
      iat,
      exp,
    };
    response.status = 201;

    /* RESPUESTA */
    return response;
  }

  async loginTokenV2(
    funcionarioId: any,
    aplicacionId: any,
    origen: any,
    token: any,
  ): Promise<IResponse> {
    /* INICIALIZACION DE VARIABLES */
    let response = {
      error: true,
      message: 'Existen problemas con el servicio validar usuario.',
      response: {},
      status: 500,
    };

    /* OPERACION */

    const data1 = {
      where: 'id = :id',
      value: {
        id: aplicacionId,
      },
    };
    response = await this.aplicacionQueryService.selectAplicacion(data1);
    if (response.error === false) {
      const hash = '';
      response = await this.dataTokenV2(
        funcionarioId,
        aplicacionId,
        hash,
        origen,
        token,
      );
    } else {
      response.message = 'El funcionario no tiene acceso a la aplicación.';
      response.response = {
        errors: {
          funcionario: ['El funcionario no tiene acceso a la aplicación.'],
        },
      };
    }

    /* RESPUESTA */
    return response;
  }

  async dataTokenV2(
    funcionarioId: any,
    aplicacionId: any,
    hash: any,
    origen: any,
    token: any,
  ): Promise<IResponse> {
    /* INICIALIZACION DE VARIABLES */
    let response = {
      error: true,
      message: 'Existen problemas con el servicio obtener los datos de login.',
      response: {},
      status: 500,
    };

    /* OPERACION */
    response = await this.funcionarioQueryService.viewFuncionario(
      funcionarioId,
    );
    const dataFuncionario = response.response;

    response = await this.funcionarioQueryService.selectInstitucion(
      funcionarioId,
    );
    const dataInstitucion = response.response;

    response = await this.funcionarioQueryService.selectCargo(funcionarioId);
    const dataCargo = response.response;

    let cargoNombre = '';
    if (dataCargo != undefined) {
      cargoNombre = dataCargo['nombreCargo'];
    }

    interface UserData {
      id: number;
      nombre: string;
      paterno: string;
      materno: string;
      ci: number;
      celular: number;
      cargo: string;
      idFoto: number;
      institucionId: number;
      rutaLogo: string;
      nombreLogo: string;
      colorMenu: string;
      textoMenu: string;
      colorPrimario: string;
      fotoRuta: string;
      aplicacionId: number;
      departamentoId: number;
      entidadId: number;
      municipioId: number;
      oficinaId: number;
      divisionId: number;
    }
    const user = [];
    const valida: UserData = {
      id: funcionarioId,
      nombre: dataFuncionario[0].nombre,
      paterno: dataFuncionario[0].paterno,
      materno: dataFuncionario[0].materno,
      ci: dataFuncionario[0].ci,
      celular: dataFuncionario[0].celular,
      fotoRuta: dataFuncionario[0].fotoRuta,
      cargo: cargoNombre,
      idFoto: dataFuncionario[0].idFoto,
      institucionId: dataInstitucion[0].institucionId,
      rutaLogo: dataInstitucion[0].rutaLogo,
      nombreLogo: dataInstitucion[0].nombreLogo,
      colorMenu: dataInstitucion[0].colorMenu,
      textoMenu: dataInstitucion[0].textoMenu,
      colorPrimario: dataInstitucion[0].colorPrimario,
      aplicacionId: aplicacionId,

      departamentoId: dataFuncionario[0].departamentoId,
      entidadId: dataFuncionario[0].entidadId,
      municipioId: dataFuncionario[0].municipioId,
      oficinaId: dataFuncionario[0].oficinaId,
      divisionId: dataFuncionario[0].divisionId,
    };
    user.push(valida);

    const expToken = await this.jwtService.decode(token);
    const iat = expToken['iat'];
    const exp = expToken['exp'];
    interface SesionData {
      funcionarioId: number;
      aplicacionId: number;
      token: string;
    }

    const sesion: SesionData = {
      funcionarioId: funcionarioId,
      aplicacionId: aplicacionId,
      token: token,
    };

    if (hash === '') {
      response = await this.sesionQueryService.insertSesion(
        sesion,
        funcionarioId,
      );

      const data1 = {
        where: 'id = :id',
        value: {
          id: aplicacionId,
        },
      };
      response = await this.aplicacionQueryService.selectAplicacion(data1);
      const dataAplicacion = response.response;
      const codigo = 0;
      const nameFuncionario = `${dataFuncionario[0].nombre} ${dataFuncionario[0].paterno} ${dataFuncionario[0].materno}`;

      const logs = {
        funcionario: nameFuncionario,
        ci: dataFuncionario[0].ci,
        aplicacion: dataAplicacion['Auth_Aplicaciones_codigo'],
        codigo,
        origen: {
          ip: origen['ip'],
          userAgent: origen['userAgent'],
        },
      };

      const logSesion = new this.sesionesDocument(logs);
      await logSesion.save();
    }

    const dataRoles =
      await this.funcionarioRolQueryService.selectFuncionarioRolV3(
        funcionarioId,
        aplicacionId,
      );

    const roles = dataRoles?.response.map((item) => item.roles_nombre) || [];
    const roles_id = dataRoles?.response.map((item) => item.roles_id) || [];

    const dataPermisos =
      await this.rolPermisoQueryService.selectRolPermisoStatusV2(
        roles_id,
        aplicacionId,
      );
    const permisos =
      dataPermisos?.response.map((item) => item.permisos_nombre) || [];

    const funAppData =
      await this.funcionarioAplicacionQueryService.getAplicacionById(
        aplicacionId,
      );

    response.error = false;
    response.message = 'Login correcto.';
    response.response = {
      user,
      apps: funAppData.response[0],
      roles,
      permisos,
      token,
      iat,
      exp,
    };
    response.status = 201;

    /* RESPUESTA */
    return response;
  }

  async confirmation(data: any, origen: any): Promise<IResponse> {
    /* INICIALIZACION DE VARIABLES */
    let response = {
      error: true,
      message: 'Existen problemas con el servicio login de usuario.',
      response: {},
      status: 500,
    };

    /* OPERACION */
    response = await this.authQueryService.selectConfirmacion(
      data.funcionarioId,
      data.aplicacionId,
    );

    if (response.error === false) {
      if (data.code === response.response[0].codigo) {
        const hash = '';
        const dateNow = new Date();

        const dateConfirmation = response.response[0].fecha;
        const numberConfirmation = dateConfirmation.getTime();

        const sumarMinutos = process.env.TIME_CODE_AUTENTICATION;
        const addMinutos = parseInt(sumarMinutos) * 60000;

        const newConfirmation = new Date(numberConfirmation + addMinutos);

        if (dateNow.getTime() < newConfirmation.getTime()) {
          response = await this.dataToken(
            data.funcionarioId,
            data.aplicacionId,
            hash,
            origen,
          );
        } else {
          response.error = true;
          response.message = 'Supero el tiempo límite de validez del código.';
          response.response = {
            errors: {
              codigo: ['Supero el tiempo límite de validez del código.'],
            },
          };
          response.status = 422;
        }
      } else {
        response.error = true;
        response.message = 'El código proporcionado es incorrecto.';
        response.response = {
          errors: {
            codigo: ['El código proporcionado es incorrecto.'],
          },
        };
        response.status = 422;
      }
    } else {
      response.error = true;
      response.message = 'Los datos del funcionario son incorrectos.';
      response.response = {
        errors: {
          funcionario: ['Los datos del funcionario son incorrectos.'],
        },
      };
      response.status = 422;
    }

    /* RESPUESTA */
    return response;
  }

  async validateToken(token: any): Promise<IResponse> {
    /* INICIALIZACION DE VARIABLES */
    let response = {
      error: true,
      message: 'Existen problemas con el servicio validar token.',
      response: {},
      status: 500,
    };

    /* OPERACION */
    try {
      const tokenData = await this.jwtService.verifyAsync(token.token);
      const funapp =
        await this.funcionarioAplicacionQueryService.selectFuncionarioAppStatus(
          tokenData.sub[0].idFuncionario,
          tokenData.sub[2].idAplicacion,
        );

      response = await this.sesionQueryService.selectSesionByTokenAppFun(
        token.token,
        funapp.response['id'],
      );

      if (response.error === false) {
        response = await this.funcionarioQueryService.selectDataId(
          tokenData.sub[0].idFuncionario,
        );

        interface dataUser {
          aplicacionId: number;
          funcionarioId: number;
          personaId: number;
          cargoId: number;
          unidadOrganizacionalId: number;
          institucionId: number;
          entidadId: number;
          oficinaId: number;
          divisionId: number;
          municipioId: number;
          departamentoId: number;
          esResponsableUnidad: number;
          ci: string;
          nombreCompleto: string;
        }

        const valida: dataUser = {
          aplicacionId: Number(tokenData.sub[2].idAplicacion),
          funcionarioId: response.response[0].funcionarioId,
          institucionId: response.response[0].institucionId,
          cargoId: response.response[0].cargoId,
          unidadOrganizacionalId: response.response[0].unidadOrganizacionalId,
          esResponsableUnidad: response.response[0].esResponsableUnidad,
          entidadId: response.response[0].entidadId,
          oficinaId: response.response[0].oficinaId,
          divisionId: response.response[0].divisionId,
          municipioId: response.response[0].municipioId,
          departamentoId: response.response[0].departamentoId,
          personaId: response.response[0].personaId,
          ci: response.response[0].ci,
          nombreCompleto: response.response[0].nombreCompleto,
        };

        response.error = false;
        response.message = 'Token válido.';
        response.response = valida;
        response.status = 201;
      } else {
        response.error = true;
        response.message = 'Token inválido.';
        response.response = {
          errors: {
            token: ['El token enviado a expirado.'],
          },
        };
        response.status = 401;
      }
    } catch (error) {
      switch (error.message) {
        case 'invalid signature':
          response.message = 'Token no es válido.';
          response.response = {
            errors: {
              token: ['El token no es valido.'],
            },
          };
          return response;
        case 'jwt expired':
          response.message = 'Token caducado.';
          response.response = {
            errors: {
              token: ['El token enviado ya caduco.'],
            },
          };
          return response;
        default:
          response.message = error.message;
          response.status = 401;
          return response;
      }
    }

    /* RESPUESTA */
    return response;
  }

  async validateToken_v2(token: any): Promise<IResponse> {
    /* INICIALIZACION DE VARIABLES */
    let response = {
      error: true,
      message: 'Existen problemas con el servicio validar token.',
      response: {},
      status: 500,
    };

    /* OPERACION */
    try {
      const tokenData = await this.jwtService.verifyAsync(token);
      response = await this.funcionarioQueryService.selectDataId(
        tokenData.sub[1].idFuncionario,
      );
      // response = await this.sesionQueryService.selectSesionByTokenAppFun(
      //   token.token,
      //   funapp.response['id'],
      // );

      if (response.error === false) {
        interface dataUser {
          aplicacionId: number;
          funcionarioId: number;
          personaId: number;
          cargoId: number;
          unidadOrganizacionalId: number;
          institucionId: number;
          entidadId: number;
          oficinaId: number;
          divisionId: number;
          municipioId: number;
          departamentoId: number;
          ci: string;
          nombreCompleto: string;
        }

        const valida: dataUser = {
          aplicacionId: Number(tokenData.sub[0].idAplicacion),
          funcionarioId: response.response[0].funcionarioId,
          institucionId: response.response[0].institucionId,
          cargoId: response.response[0].cargoId,
          unidadOrganizacionalId: response.response[0].unidadOrganizacionalId,
          entidadId: response.response[0].entidadId,
          oficinaId: response.response[0].oficinaId,
          divisionId: response.response[0].divisionId,
          municipioId: response.response[0].municipioId,
          departamentoId: response.response[0].departamentoId,
          personaId: response.response[0].personaId,
          ci: response.response[0].ci,
          nombreCompleto: response.response[0].nombreCompleto,
        };

        response.error = false;
        response.message = 'Token válido.';
        response.response = valida;
        response.status = 201;
      } else {
        response.error = true;
        response.message = 'Token inválido.';
        response.response = {
          errors: {
            token: ['El token enviado a expirado.'],
          },
        };
        response.status = 401;
      }
    } catch (error) {
      response.error = true;
      response.message = 'Token inválido.';
      response.response = {
        errors: {
          token: ['El token enviado es incorrecto.'],
        },
      };
      response.status = 401;
    }

    /* RESPUESTA */
    return response;
  }

  async permits(data: permit): Promise<IResponse> {
    /* INICIALIZACION DE VARIABLES */
    const response = {
      error: true,
      message: 'Existen problemas con el servicio validar token.',
      response: {},
      status: 500,
    };

    /* OPERACION */
    try {
      const dataRoles =
        await this.funcionarioRolQueryService.selectFuncionarioRol4(
          data.funcionarioId,
        );

      const roles = [];

      for (const key in dataRoles.response) {
        if (Object.prototype.hasOwnProperty.call(dataRoles.response, key)) {
          const element = dataRoles.response[key];
          if (element.per_nombre !== null) {
            roles.push(element.per_nombre);
          }
        }
      }

      response.error = false;
      response.message = 'Obtención de los permisos correctamente.';
      response.response = roles;
      response.status = 201;
    } catch (error) {
      response.error = true;
      response.message = 'No se pudo realizar la solicitud.';
      response.response = {
        errors: {
          permiso: [`${error.message}`],
        },
      };
      response.status = 422;
    }

    /* RESPUESTA */
    return response;
  }

  async permits_v2(data: any): Promise<IResponse> {
    /* INICIALIZACION DE VARIABLES */
    const response = {
      error: true,
      message: 'Existen problemas con el servicio validar token.',
      response: {},
      status: 500,
    };

    /* OPERACION */
    try {
      let aplicacionId = null;
      let funcionarioId = null;
      const tokenData = await this.jwtService.verifyAsync(data.token);
      tokenData.sub.forEach((item) => {
        if ('idAplicacion' in item) aplicacionId = item.idAplicacion;
        if ('idFuncionario' in item) funcionarioId = item.idFuncionario;
      });

      const app = await this.funcionarioAplicacionQueryService.getById(
        aplicacionId,
      );

      const dataRoles =
        await this.funcionarioRolQueryService.selectFuncionarioRolV3(
          funcionarioId,
          aplicacionId,
        );

      if (dataRoles.error)
        throw new Error('el usuario actual no tiene sesion disponible');
      if (dataRoles.response.length == 0)
        throw new Error('el usuario actual no tiene ninguna sesion disponible');
      const roles = dataRoles?.response.map((item) => item.roles_nombre) || [];
      const roles_id = dataRoles?.response.map((item) => item.roles_id) || [];

      const dataPermisos =
        await this.rolPermisoQueryService.selectRolPermisoStatusV2(
          roles_id,
          aplicacionId,
        );
      if (dataPermisos.error)
        throw new Error('el usuario actual no tiene ningun permiso asignado');
      if (dataPermisos.response.length == 0)
        throw new Error('el usuario actual no tiene ningun permiso asignado');
      const permisos =
        dataPermisos?.response.map((item) => item.permisos_nombre) || [];
      response.error = false;
      response.message = 'Obtención de los permisos correctamente.';
      response.response = {
        app: app.response[0],
        roles,
        permisos,
      };
      response.status = 201;
    } catch (error) {
      response.error = true;
      response.message = error.message;
      response.response = {};
      response.status = 422;
    }

    /* RESPUESTA */
    return response;
  }

  async refreshToken(data: tokenDTO, origen: any): Promise<IResponse> {
    /* INICIALIZACION DE VARIABLES */
    let response = {
      error: true,
      message: 'Existen problemas con el servicio refresh token',
      response: {},
      status: 500,
    };

    /* OPERACION */
    try {
      const sesion = await this.sesionQueryService.selectSesionByToken(
        data.token,
      );
      if (sesion.error === false) {
        response = await this.dataToken(
          sesion.response[0].funcionarioId,
          sesion.response[0].aplicacionId,
          data.token,
          origen,
        );

        response.error = false;
        response.message = 'Refresh Token correcto.';
        response.response = response.response['token'];
        response.status = 201;
      } else {
        response.error = true;
        response.message = 'Token inválido.';
        response.response = {
          errors: {
            token: ['El token enviado a expirado.'],
          },
        };
        response.status = 401;
      }
    } catch (error) {
      response.error = true;
      response.message = 'Token inválido.';
      response.response = {
        errors: {
          token: ['El token enviado es incorrecto.'],
        },
      };
      response.status = 401;
    }

    /* RESPUESTA */
    return response;
  }

  async logoutToken(data: tokenDTO): Promise<IResponse> {
    /* INICIALIZACION DE VARIABLES */
    let response = {
      error: true,
      message: 'Existen problemas con el servicio logout.',
      response: {},
      status: 500,
    };

    /* OPERACION */

    try {
      const tokenData = await this.jwtService.verifyAsync(data.token);

      const funapp =
        await this.funcionarioAplicacionQueryService.selectFuncionarioAppStatus(
          tokenData.sub[0].idFuncionario,
          tokenData.sub[2].idAplicacion,
        );

      response = await this.sesionQueryService.selectSesionByTokenAppFun(
        data.token,
        funapp.response['id'],
      );

      if (response.error === false) {
        response = await this.sesionQueryService.statusSesion(
          response.response['id'],
        );

        if (response.error === false) {
          response.error = false;
          response.message = 'Logout correcto.';
          response.response = [];
          response.status = 201;
        }
      } else {
        response.error = true;
        response.message = 'Token inválido.';
        response.response = {
          errors: {
            token: ['El token enviado a expirado.'],
          },
        };
        response.status = 401;
      }
    } catch (error) {
      response.error = true;
      response.message = 'Token inválido.';
      response.response = {
        errors: {
          token: ['El token enviado es incorrecto.'],
        },
      };
      response.status = 401;
    }

    /* RESPUESTA */
    return response;
  }

  async logoutSession(token: string, tokenData: any): Promise<IResponse> {
    /* INICIALIZACION DE VARIABLES */
    let response = {
      error: true,
      message: 'Existen problemas con el servicio logout.',
      response: {},
      status: 500,
    };
    try {
      let aplicacionId = null;
      let funcionarioId = null;
      tokenData.sub.forEach((item) => {
        if ('idAplicacion' in item) aplicacionId = item.idAplicacion;
        if ('idFuncionario' in item) funcionarioId = item.idFuncionario;
      });

      const funapp =
        await this.funcionarioAplicacionQueryService.selectFuncionarioAppStatus(
          funcionarioId,
          aplicacionId,
        );
      if (funapp.error) return funapp;

      response = await this.sesionQueryService.selectSesionByTokenAppFun(
        token,
        funapp.response['id'],
      );

      if (response.error === false) {
        response = await this.sesionQueryService.statusSesion(
          response.response['id'],
        );

        if (response.error === false) {
          response.error = false;
          response.message = 'Logout correcto.';
          response.response = [];
          response.status = 201;
        }
      } else {
        response.error = true;
        response.message = 'El usuario no tiene la sesion disponible.';
        response.response = {
          errors: {
            token: ['La session fue cerrada.'],
          },
        };
        response.status = 401;
      }
    } catch (error) {
      response.message = error.message;
    } finally {
      return response;
    }
  }

  async logoutTokenV2(data: tokenDTO): Promise<IResponse> {
    /* INICIALIZACION DE VARIABLES */
    const response = {
      error: true,
      message: 'Existen problemas con el servicio logout.',
      response: {},
      status: 500,
    };

    /* OPERACION */

    try {
      const tokenData = await this.jwtService.verify(data.token);
      const verificar = await this.logoutSession(data.token, tokenData);
      return verificar;
    } catch (error) {
      response.error = true;
      switch (error.message) {
        case 'invalid signature':
          response.message = 'Token no es válido.';
          response.response = {
            errors: {
              token: ['El token enviado no corresponde a este sistema.'],
            },
          };
          response.status = 401;
          return response;
        case 'jwt expired':
          response.message = 'Token Expiro.';
          response.response = {
            errors: {
              token: ['El token enviado ya caduco.'],
            },
          };
          const jwtData = this.jwtService.decode(data.token);
          const cerrarSession = await this.logoutSession(data.token, jwtData);
          return cerrarSession;
        default:
          response.message = error.message;
          response.status = 401;
          return response;
      }
    }

    /* RESPUESTA */
    // return response;
  }

  async recoverPassword(data: recoverDTO): Promise<IResponse> {
    /* INICIALIZACION DE VARIABLES */
    let response = {
      error: true,
      message: 'Existen problemas con el servicio cambiar contraseña.',
      response: {},
      status: 500,
    };

    /* OPERACION */
    try {
      const data1 = {
        where: 'usuario = :usuario',
        value: {
          usuario: data.usuario,
        },
      };
      response = await this.funcionarioQueryService.selectFuncionario(data1);
      const dataFuncionario = response.response;

      if (response.error === false) {
        const data2 = {
          where: 'codigo = :codigo',
          value: {
            codigo: data.aplicacion,
          },
        };
        response = await this.aplicacionQueryService.selectAplicacion(data2);
        const dataAplicacion = response.response;

        if (response.error === false) {
          const data3 = {
            where: 'id = :id',
            value: {
              id: dataFuncionario['Auth_Funcionarios_perfilPersonaId'],
            },
          };
          response = await this.personaQueryService.selectPersona(data3);
          const dataPersona = response.response;

          const min = 100000;
          const max = 999999;
          const codeConfirmation =
            Math.floor(Math.random() * (max - min)) + min;
          const numero = `591${dataPersona['Auth_Perfil_Persona_celular']}`;
          const sms = `*${dataAplicacion['Auth_Aplicaciones_nombre']}* \n\n Buenos días _${dataPersona['Auth_Perfil_Persona_nombre']}_ \n 🔑 Este es tu código para recuperar tu contraseña: *${codeConfirmation}* \n ⏰ El tiempo de validez del código es: *${process.env.TIME_CODE_RECOVER} min* \n\n ✅ https://jl.fiscalia.gob.bo \n ᴶᴸ ⁻ ⱽ¹ ⁻ ᴹᴵᴺᴵˢᵀᴱᴿᴵᴼ ᴾᵁᴮᴸᴵᶜᴼ`;

          //Se envia mensaje de whatsapp con el codigo
          response.response = smsWhatsapp(
            numero,
            sms,
            dataAplicacion['Auth_Aplicaciones_nombre'],
          );

          //guardamos el codigo generado en la BD
          response = await this.authQueryService.insertRecover(
            dataFuncionario['Auth_Funcionarios_id'],
            dataAplicacion['Auth_Aplicaciones_id'],
            codeConfirmation,
          );

          //
          const celularString = String(
            dataPersona['Auth_Perfil_Persona_celular'],
          );
          const first = celularString.substr(0, 1);
          const last = celularString.substr(6, 2);
          const celularLocked = `${first}*****${last}`;

          //retonamos el id del codigo generado, para comparar facil cuando retorne TODO
          response.error = false;
          response.message =
            'El código de recuperación de contraseña se envió correctamente.';
          response.response = {
            celular: celularLocked,
            codigoid: response.response,
          };
          response.status = 201;
        } else {
          response.error = true;
          response.message = 'El nombre de la aplicación es incorrecta.';
          response.response = {
            errors: {
              aplicacion: ['El nombre de la aplicación es incorrecta.'],
            },
          };
          response.status = 422;
        }
      } else {
        response.error = true;
        response.message = 'El nombre de usuario es incorrecto.';
        response.response = {
          errors: {
            funcionario: ['El nombre de usuario es incorrecto.'],
          },
        };
        response.status = 422;
      }
    } catch (error) {
      response.error = true;
      response.message = 'No se pudo realizar la solicitud.';
      response.response = {
        errors: {
          change: [`${error.message}`],
        },
      };
      response.status = 422;
    }

    /* RESPUESTA */
    return response;
  }

  async confirmCode(data: any): Promise<IResponse> {
    /* INICIALIZACION DE VARIABLES */
    let response = {
      error: true,
      message:
        'Existen problemas con el servicio confirmación del codigo en cambio de contraseña.',
      response: {},
      status: 500,
    };

    /* OPERACION */
    try {
      const data1 = {
        where: 'usuario = :usuario',
        value: {
          usuario: data.usuario,
        },
      };
      response = await this.funcionarioQueryService.selectFuncionario(data1);
      //const dataFuncionario = response.response;

      if (response.error === false) {
        const data2 = {
          where: 'codigo = :codigo',
          value: {
            codigo: data.aplicacion,
          },
        };
        response = await this.aplicacionQueryService.selectAplicacion(data2);
        //const dataAplicacion = response.response;

        if (response.error === false) {
          /*
          response = await this.authQueryService.selectConfirmCode(
            dataFuncionario['Auth_Funcionarios_id'],
            dataAplicacion['Auth_Aplicaciones_id'],
          );
          */

          //buscamos que codigo fue
          response = await this.authQueryService.selectConfirmCode(
            data.codigoid,
          );

          if (response.error === false) {
            if (data.code === response.response[0].codigo) {
              const dateNow = new Date();

              const dateConfirmation = response.response[0].fecha;
              const numberConfirmation = dateConfirmation.getTime();

              const sumarMinutos = process.env.TIME_CODE_RECOVER;
              const addMinutos = parseInt(sumarMinutos) * 60000;

              const newConfirmation = new Date(numberConfirmation + addMinutos);

              if (dateNow.getTime() < newConfirmation.getTime()) {
                response.error = false;
                response.message = 'El código ingresado es correcto.';
                response.response = [
                  { codigo: ['El código ingresado es correcto.'] },
                ];
                response.status = 201;
              } else {
                response.error = true;
                response.message =
                  'Supero el tiempo límite de validez del código.';
                response.response = {
                  errors: {
                    codigo: ['Supero el tiempo límite de validez del código.'],
                  },
                };
                response.status = 422;
              }
            } else {
              response.error = true;
              response.message = 'El código proporcionado es incorrecto.';
              response.response = {
                errors: {
                  codigo: ['El código proporcionado es incorrecto.'],
                },
              };
              response.status = 422;
            }
          } else {
            response.error = true;
            response.message = 'Los datos del funcionario son incorrectos.';
            response.response = {
              errors: {
                funcionario: ['Los datos del funcionario son incorrectos.'],
              },
            };
            response.status = 422;
          }
        } else {
          response.error = true;
          response.message = 'El nombre de la aplicación es incorrecta.';
          response.response = {
            errors: {
              aplicacion: ['El nombre de la aplicación es incorrecta.'],
            },
          };
          response.status = 422;
        }
      } else {
        response.error = true;
        response.message = 'El nombre de usuario es incorrecto.';
        response.response = {
          errors: {
            funcionario: ['El nombre de usuario es incorrecto.'],
          },
        };
        response.status = 422;
      }
    } catch (error) {
      response.error = true;
      response.message = 'No se pudo realizar la solicitud.';
      response.response = {
        errors: {
          change: [`${error.message}`],
        },
      };
      response.status = 422;
    }

    /* RESPUESTA */
    return response;
  }

  async changePassword(data: changePasswordDTO): Promise<IResponse> {
    /* INICIALIZACION DE VARIABLES */
    let response = {
      error: true,
      message: 'Existen problemas con el servicio cambiar contraseña.',
      response: {},
      status: 500,
    };

    /* OPERACION */
    try {
      const data1 = {
        where: 'usuario = :usuario',
        value: {
          usuario: data.usuario,
        },
      };
      const dataFuncionario =
        await this.funcionarioQueryService.selectFuncionario(data1);

      const data2 = {
        where: 'codigo = :codigo',
        value: {
          codigo: data.aplicacion,
        },
      };
      const dataAplicacion = await this.aplicacionQueryService.selectAplicacion(
        data2,
      );

      response = await this.authQueryService.selectRecover(
        dataFuncionario.response['Auth_Funcionarios_id'],
        dataAplicacion.response['Auth_Aplicaciones_id'],
      );

      if (response.error === false) {
        if (data.code === response.response[0].codigo) {
          const dateNow = new Date();

          const dateConfirmation = response.response[0].fecha;
          const numberConfirmation = dateConfirmation.getTime();

          const sumarMinutos = process.env.TIME_CODE_AUTENTICATION;
          const addMinutos = parseInt(sumarMinutos) * 60000;

          const newConfirmation = new Date(numberConfirmation + addMinutos);

          if (dateNow.getTime() < newConfirmation.getTime()) {
            if (data.newPassword != data.confirmPassword) {
              response.error = true;
              response.message = 'Las contraseñas deben ser iguales.';
              response.response = {
                errors: {
                  password: ['Las contraseñas deben ser iguales.'],
                },
              };
              response.status = 422;
            } else {
              const verify = validatePassword(data.newPassword);
              if (verify) {
                const hashedPassword = await bcrypt.hash(
                  String(data.newPassword),
                  12,
                );
                const data1 = {
                  where: 'usuario = :usuario',
                  value: {
                    usuario: data.usuario,
                  },
                };

                response = await this.funcionarioQueryService.selectFuncionario(
                  data1,
                );

                response = await this.authQueryService.updatePassword(
                  response.response['Auth_Funcionarios_id'],
                  hashedPassword,
                );
              } else {
                response.error = true;
                response.message =
                  'La contraseña no cumple con los requisitos.';
                response.response = {
                  errors: {
                    password: [
                      'La contraseña no cumple con los requisitos mínimos.',
                    ],
                  },
                };
                response.status = 422;
              }
            }
          } else {
            response.error = true;
            response.message = 'Supero el tiempo límite de validez del código.';
            response.response = {
              errors: {
                codigo: ['Supero el tiempo límite de validez del código.'],
              },
            };
            response.status = 422;
          }
        } else {
          response.error = true;
          response.message = 'El código proporcionado es incorrecto.';
          response.response = {
            errors: {
              codigo: ['El código proporcionado es incorrecto.'],
            },
          };
          response.status = 422;
        }
      } else {
        response.error = true;
        response.message = 'Los datos del funcionario son incorrectos.';
        response.response = {
          errors: {
            funcionario: ['Los datos del funcionario son incorrectos.'],
          },
        };
        response.status = 422;
      }
    } catch (error) {
      response.error = true;
      response.message = 'No se pudo realizar la solicitud.';
      response.response = {
        errors: {
          change: [`${error.message}`],
        },
      };
      response.status = 422;
    }

    /* RESPUESTA */
    return response;
  }

  async ciudadania(codigo: string): Promise<IResponse> {
    /* INICIALIZACION DE VARIABLES */
    let response = {
      error: true,
      message: 'Existen problemas con el servicio validar aplicación.',
      response: {},
      status: 500,
    };

    /* OPERACION */
    const data1 = {
      where: 'codigo = :codigo',
      value: { codigo },
    };
    response = await this.aplicacionQueryService.selectAplicacion(data1);

    const global = await this.authQueryService.selectGlobal();
    let condi = 0;
    let globalCiudadania = 0;
    let globalDobleAutenticacion = 0;
    while (global.response[condi] != undefined) {
      if (global.response[condi]['codigo'] === 'ciudadania') {
        globalCiudadania = global.response[condi]['estado'];
      }

      if (global.response[condi]['codigo'] === 'dobleAutenticacion') {
        globalDobleAutenticacion = global.response[condi]['estado'];
      }
      condi++;
    }

    if (response.response['Auth_Aplicaciones_ciudadania'] === 0) {
      response.error = false;
      response.message = 'No permite el logeo con ciudadania digital.';
      response.response = {
        ciudadania: response.response['Auth_Aplicaciones_ciudadania'],
        globalCiudadania: globalCiudadania,
        globalDobleAutenticacion: globalDobleAutenticacion,
      };
      response.status = 201;
    } else {
      response.error = false;
      response.message = 'Si permite el logeo con ciudadania digital.';
      response.response = {
        ciudadania: response.response['Auth_Aplicaciones_ciudadania'],
        globalCiudadania: globalCiudadania,
        globalDobleAutenticacion: globalDobleAutenticacion,
      };
      response.status = 201;
    }

    /* RESPUESTA */
    return response;
  }
}
