import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Request,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AppointmentService } from './appointment.service';
import { NextAvailableService } from './next-available.service';

@Controller('appointment')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AppointmentController {
  constructor(
    private appointmentService: AppointmentService,
    private nextAvailableService: NextAvailableService,
  ) {}

  @Post()
  @Roles('PATIENT')
  bookAppointment(
    @Request() req,
    @Body('doctorId') doctorId: number,
    @Body('date') date: string,
    @Body('startTime') startTime: string,
    @Body('endTime') endTime: string,
  ) {
    return this.appointmentService.bookAppointment(req.user.userId, {
      doctorId,
      date,
      startTime,
      endTime,
    });
  }

  @Get('my')
  @Roles('PATIENT')
  getMyAppointments(@Request() req) {
    return this.appointmentService.getPatientAppointments(req.user.userId);
  }

  @Get('doctor')
  @Roles('DOCTOR')
  getDoctorAppointments(@Request() req) {
    return this.appointmentService.getDoctorAppointments(req.user.userId);
  }

  @Patch(':id/cancel')
  @Roles('PATIENT')
  cancelAppointment(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.appointmentService.cancelAppointment(req.user.userId, id);
  }

  @Patch(':id/reschedule')
  @Roles('PATIENT')
  rescheduleAppointment(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body('date') date: string,
    @Body('startTime') startTime: string,
    @Body('endTime') endTime: string,
  ) {
    return this.appointmentService.rescheduleAppointment(req.user.userId, id, {
      date,
      startTime,
      endTime,
    });
  }

  @Get('next-available')
  @Roles('PATIENT')
  getNextAvailable(@Query('doctorId') doctorId: number) {
    return this.nextAvailableService.findNextAvailable(doctorId);
  }
}