import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized');

    server.use((socket: any, next) => {
      try {
        const token =
          socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];
        if (!token) {
          return next(new Error('Unauthorized'));
        }

        const payload = this.jwtService.verify(token);
        socket.user = payload;
        next();
      } catch (err) {
        next(new Error('Unauthorized'));
      }
    });
  }

  async handleConnection(client: any) {
    const userId = client.user?.userId; // userId from payload
    if (userId) {
      const rooms = await this.chatService.getUserRooms(userId);
      rooms.forEach((room) => {
        client.join(`room_${room.id}`);
      });
      client.join(`user_${userId}`);
      this.logger.log(
        `Client ${client.id} (User ${userId}) joined ${rooms.length} rooms and user_${userId}`,
      );
    } else {
      this.logger.log(`Client connected: ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
