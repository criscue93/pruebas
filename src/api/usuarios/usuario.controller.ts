import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Res,
  Version,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { validate } from 'class-validator';
import { Response } from 'express';
import { TokenDecorator } from 'src/decorators/token.decorator';
import { sanitizeString } from 'src/helpers/sanitize.helper';
import { verificarPermiso } from 'src/helpers/verifyPermiso.helper';
import { IResponse } from 'src/interfaces/IResponse';
import { usuarioDTO } from './usuario.dto';
import { UsuarioService } from './usuario.service';

@ApiTags('USUARIOS')
@ApiBearerAuth()
@Controller('api/usuario')
export class UsuarioController {
  constructor(private readonly serviceData: UsuarioService) {}

  @Version('1')
  @Get('/list')
  @ApiOperation({
    summary: 'Servicio para obtener toda la información de la tabla.',
  })
  async list(@TokenDecorator() tokenValid: IResponse, @Res() res: Response) {
    /** Inicialización de Variables **/
    let response = tokenValid;
    const permiso = 'VIEW_CATALOGO';

    /** Operación **/
    if (response.error === false) {
      const userInfo = response.response;
      if (verificarPermiso(userInfo.permisos, permiso)) {
        response = await this.serviceData.list();
      } else {
        response.error = true;
        response.message = 'No tiene permisos.';
        response.response = {
          errors: { permiso: [permiso] },
        };
        response.status = 422;
      }
    } else {
      response.status = 401;
    }

    /** Respuesta **/
    return res.status(response.status).json(response);
  }

  @Version('1')
  @Post('/listFilter')
  @ApiOperation({
    summary:
      'Servicio para obtener toda la información de la tabla con filtros.',
  })
  async listFilter(
    @TokenDecorator() tokenValid: IResponse,
    @Res() res: Response,
    @Body() body: any,
  ) {
    /** Inicialización de Variables **/
    let response = tokenValid;
    const permiso = 'VIEW_LIST_CATALOGOS';

    /** Operación **/
    if (response.error === false) {
      const userInfo = response.response;
      if (verificarPermiso(userInfo.permisos, permiso)) {
        response = await this.serviceData.listFilter(body);
      } else {
        response.error = true;
        response.message = 'No tiene permisos.';
        response.response = {
          errors: { permiso: [permiso] },
        };
        response.status = 422;
      }
    } else {
      response.status = 401;
    }

    /** Respuesta **/
    return res.status(response.status).json(response);
  }

  @Version('1')
  @Post('/insert')
  @ApiOperation({
    summary: 'Servicio para insertar nuevos datos a la tabla.',
  })
  @ApiBody({
    schema: {
      properties: {
        nombre: {
          type: 'string',
          example: 'Nombre de la actividad de asistencia',
        },
        plazoMinimo: { type: 'number', example: 2 },
        plazoMaximo: { type: 'number', example: 2 },
        sorteo: { type: 'number', example: 2 },
        areaId: { type: 'number', example: 1 },
        respuestas: {
          type: 'array',
          example: [1, 2, 3, 4],
        },
        etapas: {
          type: 'array',
          example: [1, 2, 3, 4],
        },
        tipoSujeto: {
          type: 'array',
          example: [1, 2, 3, 4],
        },
        tipoSolicitud: {
          type: 'array',
          example: [1, 2],
        },
      },
    },
  })
  async insertData(
    @TokenDecorator() tokenValid: IResponse,
    @Res() res: Response,
    @Body() body: usuarioDTO,
  ) {
    /** Inicialización de Variables **/
    let response = tokenValid;
    const permiso = 'INSERT_CATALOGO';

    /** Operación **/
    if (response.error === false) {
      const userInfo = response.response;
      if (verificarPermiso(userInfo.permisos, permiso)) {
        const data = new usuarioDTO();
        data.usuario = body.usuario;
        data.password = body.password;
        data.nombre = sanitizeString(body.nombre);
        data.paterno = sanitizeString(body.paterno);
        data.materno = sanitizeString(body.materno);
        data.ci = body.ci;
        data.direccion = sanitizeString(body.direccion);
        data.celular = body.celular;
        data.email = body.email;

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
          response = await this.serviceData.insert(
            data,
            userInfo.user.funcionarioId,
          );
        }
      } else {
        response.error = true;
        response.message = 'No tiene permisos.';
        response.response = {
          errors: { permiso: [permiso] },
        };
        response.status = 422;
      }
    } else {
      response.status = 401;
    }

    /** Respuesta **/
    return res.status(response.status).json(response);
  }

  @Version('1')
  @Put('/update/:id')
  @ApiOperation({
    summary: 'Servicio para editar los datos de una tupla.',
  })
  @ApiBody({
    schema: {
      properties: {
        nombre: {
          type: 'string',
          example: 'Nombre de la actividad de asistencia',
        },
        plazoMinimo: { type: 'number', example: 2 },
        plazoMaximo: { type: 'number', example: 2 },
        sorteo: { type: 'number', example: 2 },
        areaId: { type: 'number', example: 1 },
        respuestas: {
          type: 'object',
          example: [1, 2, 3, 4],
        },
        etapas: {
          type: 'object',
          example: [1, 2, 3, 4],
        },
        tipoSolicitud: {
          type: 'array',
          example: [1, 2],
        },
      },
    },
  })
  async updateData(
    @TokenDecorator() tokenValid: IResponse,
    @Res() res: Response,
    @Body() body: usuarioDTO,
    @Param('id') id: number,
  ) {
    /** Inicialización de Variables **/
    let response = tokenValid;
    const permiso = 'EDIT_CATALOGO';

    /** Operación **/
    if (response.error === false) {
      const userInfo = response.response;
      if (verificarPermiso(userInfo.permisos, permiso)) {
        const data = new usuarioDTO();
        data.nombre = sanitizeString(body.nombre);
        data.usuario = body.usuario;
        data.password = body.password;
        data.nombre = sanitizeString(body.nombre);
        data.paterno = sanitizeString(body.paterno);
        data.materno = sanitizeString(body.materno);
        data.ci = body.ci;
        data.direccion = sanitizeString(body.direccion);
        data.celular = body.celular;
        data.email = body.email;

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
          response = await this.serviceData.update(
            data,
            id,
            userInfo.user.funcionarioId,
          );
        }
      } else {
        response.error = true;
        response.message = 'No tiene permisos.';
        response.response = {
          errors: { permiso: [permiso] },
        };
        response.status = 422;
      }
    } else {
      response.status = 401;
    }

    /** Respuesta **/
    return res.status(response.status).json(response);
  }

  @Version('1')
  @Patch('/status/:id')
  @ApiOperation({
    summary: 'Servicio para cambiar el estado de una tupla.',
  })
  async statusData(
    @TokenDecorator() tokenValid: IResponse,
    @Res() res: Response,
    @Param('id') id: number,
  ) {
    /** Inicialización de Variables **/
    let response = tokenValid;
    const permiso = 'EDIT_CATALOGO';

    /** Operación **/
    if (response.error === false) {
      const userInfo = response.response;
      if (verificarPermiso(userInfo.permisos, permiso)) {
        response = await this.serviceData.status(
          id,
          userInfo.user.funcionarioId,
        );
      } else {
        response.error = true;
        response.message = 'No tiene permisos.';
        response.response = {
          errors: { permiso: [permiso] },
        };
        response.status = 422;
      }
    } else {
      response.status = 401;
    }

    /** Respuesta **/
    return res.status(response.status).json(response);
  }

  @Version('1')
  @Delete('/delete/:id')
  @ApiOperation({
    summary: 'Servicio para eliminar una tupla.',
  })
  async deleteData(
    @TokenDecorator() tokenValid: IResponse,
    @Res() res: Response,
    @Param('id') id: number,
  ) {
    /** Inicialización de Variables **/
    let response = tokenValid;
    const permiso = 'DELETE_CATALOGO';

    /** Operación **/
    if (response.error === false) {
      const userInfo = response.response;
      if (verificarPermiso(userInfo.permisos, permiso)) {
        response = await this.serviceData.delete(id);
      } else {
        response.error = true;
        response.message = 'No tiene permisos.';
        response.response = {
          errors: { permiso: [permiso] },
        };
        response.status = 422;
      }
    } else {
      response.status = 401;
    }

    /** Respuesta **/
    return res.status(response.status).json(response);
  }
}
