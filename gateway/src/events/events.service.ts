import { Injectable, Logger } from '@nestjs/common';
import { Event } from '../interfaces/event.interface';
import { connect, StringCodec, NatsConnection } from 'nats';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  private nc: NatsConnection;
  private sc = StringCodec();

  constructor() {
    this.initNats().then();
  }

  async initNats() {
    try {
      this.nc = await connect({ servers: 'nats://nats:4222' });
      this.logger.log('Connected to NATS server');
    } catch (error) {
      this.logger.error('Failed to connect to NATS:', error.message);
    }
  }

  async publishToNats(events: Event[]) {
    if (!this.nc) {
      this.logger.error('NATS connection is not established');
      return;
    }

    const test = events.slice(0, 1);
    for (const event of test) {
      try {
        let subject = '';

        switch (event.source) {
          case 'facebook':
            subject = 'fb_event';
            break;
          case 'tiktok':
            subject = 'ttk_event';
            break;
          default:
            console.warn(`Unknown source. Skipping event.`);
            continue;
        }

        this.nc.publish(subject, this.sc.encode(JSON.stringify(event)));
        this.logger.log(
          `TraceId ${event.eventId}: Event published to ${subject}`,
        );
      } catch (error) {
        this.logger.error(`Failed to publish event: ${error.message}`);
      }
    }
  }
}
