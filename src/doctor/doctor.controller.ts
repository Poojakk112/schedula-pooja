import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { DoctorService } from './doctor.service';

@Controller('doctor')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('DOCTOR')
export class DoctorController {
  constructor(private doctorService: DoctorService) {}

  @Post('profile')
  createProfile(@Request() req, @Body() body) {
    return this.doctorService.createProfile(req.user.userId, body);
  }

  @Get('profile')
  getProfile(@Request() req) {
    return this.doctorService.getProfile(req.user.userId);
  }

  @Patch('profile')
  updateProfile(@Request() req, @Body() body) {
    return this.doctorService.updateProfile(req.user.userId, body);
  }

  @Get('appointments')
  getAppointments(@Request() req) {
    return this.doctorService.getDoctorAppointments(req.user.userId);
  }
}