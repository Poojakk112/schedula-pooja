import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Request,
  UseGuards,
  Query,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { DoctorService } from './doctor.service';

@Controller('doctor')
export class DoctorController {
  constructor(private doctorService: DoctorService) {}

  @Get()
  getAllDoctors(
    @Query('specialization') specialization?: string,
    @Query('search') search?: string,
    @Query('availability') availability?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.doctorService.getAllDoctors({
      specialization,
      search,
      availability,
      page,
      limit,
    });
  }

  @Get(':id')
  getDoctorById(@Param('id', ParseIntPipe) id: number) {
    return this.doctorService.getDoctorById(id);
  }

  // Protected routes (Doctor only)
  @Post('profile')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('DOCTOR')
  createProfile(@Request() req, @Body() body) {
    return this.doctorService.createProfile(req.user.userId, body);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('DOCTOR')
  getProfile(@Request() req) {
    return this.doctorService.getProfile(req.user.userId);
  }

  @Patch('profile')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('DOCTOR')
  updateProfile(@Request() req, @Body() body) {
    return this.doctorService.updateProfile(req.user.userId, body);
  }
}