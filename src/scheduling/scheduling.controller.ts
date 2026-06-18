import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { SchedulingService } from './scheduling.service';
import { SchedulingType } from './scheduling.entity';

@Controller()
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SchedulingController {
  constructor(private schedulingService: SchedulingService) {}

  @Post('doctor/scheduling-config')
  @Roles('DOCTOR')
  setConfig(
    @Request() req,
    @Body('schedulingType') schedulingType: SchedulingType,
    @Body('slotDuration') slotDuration: number,
    @Body('bufferTime') bufferTime: number,
    @Body('maxPatients') maxPatients: number,
  ) {
    return this.schedulingService.setSchedulingConfig(req.user.userId, {
      schedulingType,
      slotDuration,
      bufferTime,
      maxPatients,
    });
  }

  @Get('doctor/scheduling-config')
  @Roles('DOCTOR')
  getConfig(@Request() req) {
    return this.schedulingService.getSchedulingConfig(req.user.userId);
  }

  @Get('patient/slots')
  getSlots(
    @Query('doctorId') doctorId: number,
    @Query('date') date: string,
  ) {
    return this.schedulingService.getAvailableSlots(doctorId, date);
  }
}