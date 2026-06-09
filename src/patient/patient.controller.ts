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
import { PatientService } from './patient.service';

@Controller('patient')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PatientController {
  constructor(private patientService: PatientService) {}

  @Post('profile')
  @Roles('PATIENT')
  createProfile(@Request() req, @Body() body) {
    return this.patientService.createProfile(req.user.userId, body);
  }

  @Get('profile')
  @Roles('PATIENT')
  getProfile(@Request() req) {
    return this.patientService.getProfile(req.user.userId);
  }

  @Patch('profile')
  @Roles('PATIENT')
  updateProfile(@Request() req, @Body() body) {
    return this.patientService.updateProfile(req.user.userId, body);
  }
}