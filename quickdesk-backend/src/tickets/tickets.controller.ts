import {
    Body,
    Controller,
    Post,
    UseGuards,
    Request,
    Get,
    Patch,
    Param,
} from '@nestjs/common';

import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles/roles.decorator';
import { Role } from 'generated/prisma/enums';
import { ReplyTicketDto } from './dto/reply-ticket.dto';
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

    // ------------------for reply on Ticket-----------------------


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.AGENT)
    @Patch(":id/reply")
    reply(
        @Param("id") id: string,
        @Body() replyTicketDto: ReplyTicketDto,
        @Request() req,
    ) {

        // console.log(id);
        // console.log(replyTicketDto);

        return this.ticketsService.reply(
            Number(id), // covert string into number
            replyTicketDto,
        );

    }

}
