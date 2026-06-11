import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AvailabilityService } from './availability.service';
import { DayOfWeek } from './recurring-availability.entity';

@Controller('doctor/availability')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('DOCTOR')
export class AvailabilityController {
  constructor(private availabilityService: AvailabilityService) {}

  @Post()
  createRecurring(
    @Request() req,
    @Body('dayOfWeek') dayOfWeek: DayOfWeek,
    @Body('startTime') startTime: string,
    @Body('endTime') endTime: string,
  ) {
    return this.availabilityService.createRecurring(req.user.userId, {
      dayOfWeek,
      startTime,
      endTime,
    });
  }

  @Get()
  getRecurring(@Request() req) {
    return this.availabilityService.getRecurring(req.user.userId);
  }

  @Patch(':id')
  updateRecurring(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() body,
  ) {
    return this.availabilityService.updateRecurring(req.user.userId, id, body);
  }

  @Delete(':id')
  deleteRecurring(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.availabilityService.deleteRecurring(req.user.userId, id);
  }

  @Post('override')
  createOverride(
    @Request() req,
    @Body('date') date: string,
    @Body('startTime') startTime: string,
    @Body('endTime') endTime: string,
  ) {
    return this.availabilityService.createOverride(req.user.userId, {
      date,
      startTime,
      endTime,
    });
  }

  @Get('date')
  getByDate(
    @Request() req,
    @Query('date') date: string,
  ) {
    return this.availabilityService.getAvailabilityByDate(req.user.userId, date);
  }
}