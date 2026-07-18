import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AiModule } from 'src/ai/ai.module';
import { TicketsGateway } from './tickets.gateway';

@Module({
  imports: [PrismaModule,AiModule],
  controllers: [TicketsController],
  providers: [TicketsService, TicketsGateway],
})
export class TicketsModule {}
