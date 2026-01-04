import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { Readable } from 'stream';

describe('ApplicationsController', () => {
    let controller: ApplicationsController;
    let service: ApplicationsService;

    const mockApplicationsService = {
        generateContract: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ApplicationsController],
            providers: [
                {
                    provide: ApplicationsService,
                    useValue: mockApplicationsService,
                },
            ],
        }).compile();

        controller = module.get<ApplicationsController>(ApplicationsController);
        service = module.get<ApplicationsService>(ApplicationsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('downloadContract', () => {
        it('should stream PDF to response', async () => {
            const appId = 1;
            const pdfBuffer = Buffer.from('PDF CONTENT');

            mockApplicationsService.generateContract.mockResolvedValue(pdfBuffer);

            const mockRes = {
                set: jest.fn(),
                end: jest.fn(),
            };

            await controller.downloadContract({ user: { userId: 1 } }, appId, mockRes);

            expect(service.generateContract).toHaveBeenCalledWith(1, 1);
            expect(mockRes.set).toHaveBeenCalledWith(expect.objectContaining({
                'Content-Type': 'application/pdf',
            }));
            expect(mockRes.end).toHaveBeenCalledWith(pdfBuffer);
        });
    });
});
