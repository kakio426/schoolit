import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';
import { INestApplication } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';

describe('ChatGateway Room Logic', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        {
          provide: ChatService,
          useValue: {
            getUserRooms: jest.fn().mockResolvedValue([{ id: 101 }]),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.listen(0);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should only deliver message to clients in the same room (Test 13.2.1)', (done) => {
    const address = app.getHttpServer().address() as any;
    const port = address.port;

    // Mock connections
    (jwtService.verify as jest.Mock).mockReturnValueOnce({ userId: 1 });
    (jwtService.verify as jest.Mock).mockReturnValueOnce({ userId: 2 });

    const clientA = io(`http://localhost:${port}`, { auth: { token: 't1' }, forceNew: true });
    const clientB = io(`http://localhost:${port}`, { auth: { token: 't2' }, forceNew: true });

    clientB.on('newMessage', (msg) => {
      expect(msg.roomId).toBe(101);
      clientA.close();
      clientB.close();
      done();
    });

    clientA.on('connect', () => {
      const gateway = app.get(ChatGateway);
      // We assume the implementation uses room names like 'room_{id}'
      gateway.server.to('room_101').emit('newMessage', { roomId: 101, content: 'hello' });
    });

    // Timeout if clientB never receives the message
    setTimeout(() => {
      if (clientA.connected || clientB.connected) {
        clientA.close();
        clientB.close();
        done(new Error('Timed out waiting for room message - Room join likely not implemented'));
      }
    }, 2000);
  });
});
