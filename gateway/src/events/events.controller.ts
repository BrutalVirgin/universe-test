import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { EventsService } from './events.service';
import { Event } from '../interfaces/event.interface';

@Controller('webhook')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() payload: Event[]) {
    console.log('Received webhook event:', payload);

    await this.eventsService.publishToNats(payload);

    return { status: 'Event received and published to NATS' };
  }
}
