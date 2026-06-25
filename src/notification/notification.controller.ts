import {
  Controller,
  Get,
  Patch,
  Param,
  Request,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { NotificationService } from './notification.service';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('PATIENT')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  getNotifications(@Request() req) {
    return this.notificationService.getNotifications(req.user.userId);
  }

  @Patch(':id/read')
  markAsRead(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.notificationService.markAsRead(req.user.userId, id);
  }

  @Patch('read-all')
  markAllAsRead(@Request() req) {
    return this.notificationService.markAllAsRead(req.user.userId);
  }

  @Get('unread-count')
  getUnreadCount(@Request() req) {
    return this.notificationService.getUnreadCount(req.user.userId);
  }
}