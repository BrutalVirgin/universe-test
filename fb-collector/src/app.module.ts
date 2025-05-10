import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CollectorModule } from './collector/collector.module';

@Module({
  imports: [CollectorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
