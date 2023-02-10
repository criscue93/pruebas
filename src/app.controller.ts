import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('INICIO')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Permite verificar si el servicio está funcionando.',
  })
  @ApiResponse({ status: 200, description: 'Ok' })
  getPing(@Res() res: Response) {
    const response = this.appService.getPing();

    return res.status(response.status).json(response);
  }
}
