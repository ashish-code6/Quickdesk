import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
})
export class TicketsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinUserRoom')
  joinUserRoom(@MessageBody() userId: string) {
    return {
      message: `User ${userId} connected for ticket updates`,
    };
  }

  sendNewTicketToAgents(ticket: unknown) {
    this.server.emit('newTicketCreated', ticket);
  }

  sendResolvedTicket(ticket: { id: number; userId: string }) {
    this.server.emit('ticketResolved', ticket);
  }
}
