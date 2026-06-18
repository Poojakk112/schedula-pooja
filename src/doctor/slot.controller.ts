import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { SlotService } from './slot.service';

@Controller('doctor')
export class SlotController {
  constructor(private slotService: SlotService) {}

  @Get(':doctorId/slots')
  getSlots(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Query('date') date: string,
    @Query('duration') duration?: number,
  ) {
    return this.slotService.getSlots(doctorId, date, Number(duration) || 30);
  }
}