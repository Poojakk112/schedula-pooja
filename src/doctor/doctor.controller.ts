import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard, Roles } from '../auth/roles.guard';

@ApiTags('Doctor')
@Controller('doctor')
export class DoctorController {
  @Get('profile')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('DOCTOR')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Doctor only route' })
  getProfile(@Request() req: any) {
    return {
      message: 'Welcome Doctor!',
      user: req.user,
    };
  }
}