import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { DoctorService } from './doctor.service';

@Controller('doctor')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('DOCTOR')
export class DoctorController {
  constructor(private doctorService: DoctorService) {}

  @Get('profile')
  getProfile(@Request() req) {
    return this.doctorService.getProfile(req.user.userId);
  }
}