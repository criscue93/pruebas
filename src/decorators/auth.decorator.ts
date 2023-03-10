import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/api/auth/guards/jwt-auth.guard';

export function Auth() {
  return applyDecorators(UseGuards(JwtAuthGuard), ApiBearerAuth());
}
