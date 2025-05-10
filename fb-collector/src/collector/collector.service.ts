import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import {
  connect,
  JSONCodec,
  NatsConnection,
  AckPolicy,
  StorageType,
} from 'nats';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CollectorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CollectorService.name);
  private nc: NatsConnection;
  private readonly codec = JSONCodec();

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.connectToNats();
    await this.subscribeToFacebookEvents();
  }

  async connectToNats() {
    this.nc = await connect({ servers: 'nats://nats:4222' });
    this.logger.log('Connected to NATS');

    const jsm = await this.nc.jetstreamManager();

    const streams = await jsm.streams.list().next();
    const streamExists = streams.some((s) => s.config.name === 'FB_EVENTS');

    if (!streamExists) {
      await jsm.streams.add({
        name: 'FB_EVENTS',
        subjects: ['fb_event'],
        storage: StorageType.File,
      });
      this.logger.log('Stream FB_EVENTS создан');
    } else {
      this.logger.log('Stream FB_EVENTS уже существует');
    }
  }

  async subscribeToFacebookEvents() {
    const js = this.nc.jetstream();

    const sub = await js.pullSubscribe('fb_event', {
      config: {
        durable_name: 'fb_collector_durable',
        ack_policy: AckPolicy.Explicit,
      },
    });

    this.logger.log('Subscribed to fb_event topic');

    await (async () => {
      while (true) {
        try {
          this.logger.log('Fetching messages...');

          sub.pull({ batch: 100, expires: 1000 });

          let messageCount = 0;
          for await (const m of sub) {
            messageCount++;
            const event = this.codec.decode(m.data);
            this.logger.log(`GET EVENT: ${JSON.stringify(event)}`);
            await this.saveEvent(event);
            m.ack();
          }

          if (messageCount === 0) {
            this.logger.log('No more messages to fetch.');
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        } catch (error) {
          this.logger.error(
            `Error during message processing: ${error.message}`,
          );
        }
      }
    })();
  }

  async saveEvent(event: any) {
    try {
      await this.prisma.event.create({
        data: {
          eventId: event.eventId,
          timestamp: new Date(event.timestamp),
          source: event.source,
          funnelStage: event.funnelStage,
          eventType: event.eventType,
          data: event,
        },
      });

      this.logger.log(`Saved event ${event.eventId}`);
    } catch (error) {
      this.logger.error(`Failed to save event: ${error.message}`);
    }
  }

  async onModuleDestroy() {
    await this.nc?.drain();
  }
}
