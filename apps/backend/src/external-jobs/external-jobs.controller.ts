
import { Controller, Post, UseGuards, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { SyncWorker } from './sync/sync.worker';

@Controller('external-jobs')
export class ExternalJobsController {
    private readonly logger = new Logger(ExternalJobsController.name);

    constructor(private readonly syncWorker: SyncWorker) { }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN)
    @Post('sync')
    async triggerSync() {
        this.logger.log('Manual sync triggered by Admin');
        const stats = await this.syncWorker.syncAllExternalJobs();
        return {
            message: 'All external sources synced successfully',
            stats
        };
    }
}
