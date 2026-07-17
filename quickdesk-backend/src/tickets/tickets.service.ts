import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';


@Injectable()
export class TicketsService {

    constructor(
        private readonly prisma: PrismaService,
    ) { }

    //   async create(
    //     createTicketDto: CreateTicketDto,
    //     userId: string,
    //   ) {

    //     return {
    //       message: "Create Ticket API Working",
    //     };

    //   }

    async create(
        createTicketDto: CreateTicketDto,
        userId: string,
    ) {

        return await this.prisma.ticket.create({
            data: {
                ...createTicketDto,
                userId,
            },
        });

    }

    async findMyTickets(
        userId: string,
    ) {

        return await this.prisma.ticket.findMany({

            where: {
                userId,
            },

            orderBy: {
                createdAt: "desc",
            },

        });


    }
    async findAll() {

        return await this.prisma.ticket.findMany({

            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },

            orderBy: {
                createdAt: "desc",
            },

        });


    }

}