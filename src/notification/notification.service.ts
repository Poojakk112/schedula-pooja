import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
  ) {}

  async createNotification(
    patientId: number,
    title: string,
    message: string,
    type: NotificationType,
  ) {
    const notification = this.notificationRepo.create({
      patientId,
      title,
      message,
      type,
      isRead: false,
    });
    return this.notificationRepo.save(notification);
  }

  async getNotifications(patientId: number) {
    const notifications = await this.notificationRepo.find({
      where: { patientId },
      order: { createdAt: 'DESC' },
    });

    if (notifications.length === 0) {
      return { message: 'No notifications found', data: [] };
    }

    return notifications;
  }

  async markAsRead(patientId: number, id: number) {
    const notification = await this.notificationRepo.findOne({ where: { id } });
    if (!notification) throw new NotFoundException('Notification not found');
    if (notification.patientId !== patientId) throw new ForbiddenException('Unauthorized');
    if (notification.isRead) {
      return { message: 'Notification already marked as read', data: notification };
    }
    notification.isRead = true;
    return this.notificationRepo.save(notification);
  }

  async markAllAsRead(patientId: number) {
    const notifications = await this.notificationRepo.find({
      where: { patientId, isRead: false },
    });

    if (notifications.length === 0) {
      return { message: 'No unread notifications found', data: [] };
    }

    for (const notification of notifications) {
      notification.isRead = true;
      await this.notificationRepo.save(notification);
    }

    return { message: 'All notifications marked as read', count: notifications.length };
  }

  async getUnreadCount(patientId: number) {
    const count = await this.notificationRepo.count({
      where: { patientId, isRead: false },
    });

    return { unreadCount: count };
  }
}