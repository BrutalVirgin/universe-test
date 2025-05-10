import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async saveEvent(event: any) {
    return this.event.create({
      data: {
        eventId: event.eventId,
        timestamp: event.timestamp,
        source: event.source,
        funnelStage: event.funnelStage,
        eventType: event.eventType,
        data: JSON.parse(JSON.stringify(event.data)),
      },
    });
  }
}
