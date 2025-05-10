import { Module } from '@nestjs/common';
import { CollectorService } from './collector.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CollectorService],
})
export class CollectorModule {}
