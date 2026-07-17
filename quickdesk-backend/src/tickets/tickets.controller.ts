import {
    Body,
    Controller,
    Post,
    UseGuards,
    Request,
    Get,
} from '@nestjs/common';

import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles/roles.decorator';
import { Role } from 'generated/prisma/enums';
// import { Role } from 'generated/prisma';

@Controller('tickets')
export class TicketsController {

    constructor(
        private readonly ticketsService: TicketsService,
    ) { }

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

    @UseGuards(JwtAuthGuard)
    @Get("my")
    findMyTickets(
        @Request() req,
    ) {
        return this.ticketsService.findMyTickets(
            req.user.id,
        );
    }

    // -------------Fetch ALL ticket only Ageents----------
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.AGENT)
    @Get()
    findAll() {
        return this.ticketsService.findAll();
    }



}