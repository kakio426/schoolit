
import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';
import { INestApplication } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';

describe('ChatGateway', () => {
    let gateway: ChatGateway;
    let app: INestApplication;
    let module: TestingModule; // Expose module

    beforeAll(async () => {
        module = await Test.createTestingModule({
            providers: [
                ChatGateway,
                { provide: ChatService, useValue: {} },
                { provide: JwtService, useValue: { verify: jest.fn() } },
            ],
        }).compile();

        app = module.createNestApplication();
        await app.listen(0);
        gateway = module.get<ChatGateway>(ChatGateway);
    });

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('should reject connection without token (Test 13.1.1)', (done) => {
        const address = app.getHttpServer().address() as any;
        const port = address.port;
        const socket = io(`http://localhost:${port}`, {
            reconnectionAttempts: 0,
            forceNew: true,
        });

        socket.on('connect_error', (error) => {
            expect(error.message).toBe('Unauthorized');
            socket.close();
            done();
        });

        socket.on('connect', () => {
            socket.close();
            done(new Error('Should have rejected the connection'));
        });
    });

    it('should connect with valid token (Test 13.1.2)', (done) => {
        const address = app.getHttpServer().address() as any;
        const port = address.port;

        // Mock JWT Verification
        const fakePayload = { sub: 1, email: 'test@test.com' };
        const jwtService = module.get<JwtService>(JwtService);
        jest.spyOn(jwtService, 'verify').mockReturnValue(fakePayload);

        const socket = io(`http://localhost:${port}`, {
            auth: { token: 'valid-token' },
            forceNew: true,
        });

        socket.on('connect', () => {
            expect(socket.connected).toBeTruthy();
            socket.close();
            done();
        });

        socket.on('connect_error', (err) => {
            socket.close();
            done(new Error('Connection should have succeeded: ' + err.message));
        });
    });
});
