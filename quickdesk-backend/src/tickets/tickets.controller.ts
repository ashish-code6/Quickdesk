import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';

import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';

@Controller('tickets')
export class TicketsController {

  constructor(
    private readonly ticketsService: TicketsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createTicketDto: CreateTicketDto,
    @Request() req,
  ) {
    return this.ticketsService.create(
      createTicketDto,
      req.user.id,
    );
  }

}