
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: AuthService;

    const mockAuthService = {
        testLogin: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    describe('testLogin', () => {
        const originalEnv = process.env;

        beforeEach(() => {
            jest.resetModules();
            process.env = { ...originalEnv };
        });

        afterAll(() => {
            process.env = originalEnv;
        });

        it('should throw NotFoundException in production environment', async () => {
            process.env.NODE_ENV = 'production';

            try {
                await controller.testLogin({}, {}, undefined, undefined);
                fail('Should have thrown NotFoundException');
            } catch (error) {
                expect(error).toBeInstanceOf(NotFoundException);
            }
        });

        it('should allow testLogin in development environment', async () => {
            process.env.NODE_ENV = 'development';
            mockAuthService.testLogin.mockResolvedValue({ accessToken: 'mock-token' });

            const result = await controller.testLogin({}, {}, undefined, undefined);
            expect(result).toEqual({ accessToken: 'mock-token' });
        });
    });
});
