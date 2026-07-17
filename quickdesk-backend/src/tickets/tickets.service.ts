import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';


@Injectable()
export class TicketsService {

  constructor(
    private readonly prisma: PrismaService,
  ) {}

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

}