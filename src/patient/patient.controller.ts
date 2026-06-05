import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard, Roles } from '../auth/roles.guard';

@ApiTags('Patient')
@Controller('patient')
export class PatientController {
  @Get('profile')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('PATIENT')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Patient only route' })
  getProfile(@Request() req: any) {
    return {
      message: 'Welcome Patient!',
      user: req.user,
    };
  }
}