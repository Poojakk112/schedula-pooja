import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Request,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AppointmentService } from './appointment.service';

@Controller('appointment')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AppointmentController {
  constructor(private appointmentService: AppointmentService) {}

  @Post()
  @Roles('PATIENT')
  bookAppointment(@Request() req, @Body() body) {
    return this.appointmentService.bookAppointment(req.user.userId, body);
  }

  @Get('my')
  @Roles('PATIENT')
  getMyAppointments(@Request() req) {
    return this.appointmentService.getPatientAppointments(req.user.userId);
  }

  @Patch(':id/cancel')
  @Roles('PATIENT')
  cancelAppointment(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.appointmentService.cancelAppointment(req.user.userId, id);
  }
}