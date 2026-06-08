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
export class DoctorController {
  constructor(private doctorService: DoctorService) {}

  @Post('profile')
  @Roles('DOCTOR')
  createProfile(@Request() req, @Body() body) {
    return this.doctorService.createProfile(req.user.userId, body);
  }

  @Get('profile')
  @Roles('DOCTOR')
  getProfile(@Request() req) {
    return this.doctorService.getProfile(req.user.userId);
  }

  @Patch('profile')
  @Roles('DOCTOR')
  updateProfile(@Request() req, @Body() body) {
    return this.doctorService.updateProfile(req.user.userId, body);
  }
}