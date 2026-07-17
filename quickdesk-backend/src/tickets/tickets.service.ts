import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { ReplyTicketDto } from './dto/reply-ticket.dto';
import { Role, TicketStatus } from '@prisma/client';
import { OverrideTicketDto } from './dto/override-ticket.dto';


@Injectable()
export class TicketsService {

    constructor(
        private readonly prisma: PrismaService,
    ) { }


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

    async findOne(
        id: number,
        user: {
            id: string;
            role: Role;
        },
    ) {

        const ticket = await this.prisma.ticket.findUnique({

            where: {
                id,
            },

            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                overrideLogs: {
                    include: {
                        agent: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },

        });

        if (!ticket) {
            throw new NotFoundException('Ticket not found');
        }

        if (user.role !== Role.AGENT && ticket.userId !== user.id) {
            throw new ForbiddenException('You can only view your own tickets');
        }

        return ticket;

    }

    // -------Agent Category/Priority Override -----------------

    async override(
        id: number,
        overrideTicketDto: OverrideTicketDto,
        agentId: string,
    ) {

        const data: {
            category?: OverrideTicketDto['category'];
            priority?: OverrideTicketDto['priority'];
            aiSuggested?: boolean;
        } = {};

        if (overrideTicketDto.category) {
            data.category = overrideTicketDto.category;
        }

        if (overrideTicketDto.priority) {
            data.priority = overrideTicketDto.priority;
        }

        if (!data.category && !data.priority) {
            throw new BadRequestException('Category or priority is required');
        }

        const ticket = await this.prisma.ticket.findUnique({

            where: {
                id,
            },

        });

        if (!ticket) {
            throw new NotFoundException('Ticket not found');
        }

        const auditLogs: {
            ticketId: number;
            agentId: string;
            field: string;
            fromValue: string;
            toValue: string;
        }[] = [];

        if (data.category && data.category !== ticket.category) {
            auditLogs.push({
                ticketId: id,
                agentId,
                field: 'category',
                fromValue: ticket.category,
                toValue: data.category,
            });
        }

        if (data.priority && data.priority !== ticket.priority) {
            auditLogs.push({
                ticketId: id,
                agentId,
                field: 'priority',
                fromValue: ticket.priority,
                toValue: data.priority,
            });
        }

        if (auditLogs.length === 0) {
            throw new BadRequestException('No category or priority change detected');
        }

        data.aiSuggested = false;

        return await this.prisma.$transaction(async (tx) => {

            const updatedTicket = await tx.ticket.update({

                where: {
                    id,
                },

                data,

            });

            await tx.overrideAuditLog.createMany({
                data: auditLogs,
            });

            return updatedTicket;

        });

    }

    // -------Agent Reply -----------------

    async reply(
  id: number,
  replyTicketDto: ReplyTicketDto,
) {

  return await this.prisma.ticket.update({

    where: {
      id,
    },

    data: {
      status: TicketStatus.RESOLVED,
      finalReply: replyTicketDto.finalReply,
      resolvedAt: new Date(),
    },

  });

}



}
