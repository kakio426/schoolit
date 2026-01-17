import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
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

  // 정규식 패턴 정의 (한국 전화번호, 계좌번호)
  private readonly PHONE_REGEX = /01[016789]-?\d{3,4}-?\d{4}/g;
  private readonly ACCOUNT_REGEX = /\d{3,6}-?\d{2,6}-?\d{3,6}/g;

  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, payload: { roomId: string; message: string }) {
    // 1. JWT payload에서 유저 정보 가져오기 (인증된 유저인지 이중 확인)
    const user = (client as any).user;
    if (!user) {
      throw new Error('Unauthorized');
    }

    let cleanMessage = payload.message;
    let isMasked = false;

    // 2. 전화번호 마스킹 & 경고
    if (this.PHONE_REGEX.test(cleanMessage)) {
      cleanMessage = cleanMessage.replace(this.PHONE_REGEX, '🚫 [전화번호 가려짐]');
      isMasked = true;
    }

    // 3. 계좌번호 마스킹 & 경고
    if (this.ACCOUNT_REGEX.test(cleanMessage)) {
      cleanMessage = cleanMessage.replace(this.ACCOUNT_REGEX, '🚫 [계좌번호 가려짐]');
      isMasked = true;
    }

    // 4. 마스킹 된 경우 시스템 경고 메시지 (해당 방에만 전송)
    if (isMasked) {
      this.server.to(`room_${payload.roomId}`).emit('system_alert', {
        message:
          "🔒 개인정보 보호를 위해 연락처/계좌번호 전송이 제한됩니다. 채용 확정 후 '전자계약'을 이용해주세요.",
      });
    }

    // 5. 원래 메시지(혹은 마스킹된 메시지) 저장 및 전송
    // ChatService 기능 활용 (sendMessage 메서드 사용)
    const savedMessage = await this.chatService.sendMessage(
      Number(payload.roomId),
      user.userId,
      cleanMessage,
    );

    // 룸에 있는 모든 사용자에게 메시지 전송
    this.server.to(`room_${payload.roomId}`).emit('message', savedMessage);

    return savedMessage;
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
