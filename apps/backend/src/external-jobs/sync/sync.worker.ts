
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma.service';
import { ScraperService } from '../scraper/scraper.service';
import { AiParserService } from '../ai-parser/ai-parser.service';
import * as crypto from 'crypto';

@Injectable()
export class SyncWorker {
    private readonly logger = new Logger(SyncWorker.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly scraperService: ScraperService,
        private readonly aiParserService: AiParserService,
    ) { }

    @Cron(CronExpression.EVERY_HOUR)
    async syncSeoulJobs() {
        try {
            this.logger.log('Starting Seoul Job Sync...');
            const jobs = await this.scraperService.scrapeSeoul();

            for (const job of jobs) {
                try {
                    // Optimization: In real world, check if URL exists to avoid re-scraping details
                    const existingUrl = await (this.prisma.jobListing as any).findFirst({
                        where: { externalSourceUrl: job.link }
                    });
                    if (existingUrl) continue;

                    const detail = await this.scraperService.scrapeDetail(job.link);
                    const extracted = await this.aiParserService.parseJobPost(detail.content);

                    const mergedData = {
                        ...job,
                        schoolName: extracted.schoolName || 'Unknown School',
                        subject: extracted.subject || 'General',
                        closingDate: extracted.closingDate
                    };

                    const fingerprint = this.generateFingerprint(mergedData);

                    // Double check fingerprint
                    const existing = await (this.prisma.jobListing as any).findUnique({ where: { fingerprint } });

                    if (!existing) {
                        await (this.prisma.jobListing as any).create({
                            data: {
                                title: job.title,
                                description: detail.content || 'No description',
                                externalSourceUrl: job.link,
                                isAggregated: true,
                                fingerprint,
                                // Basic mapping
                                subjects: [mergedData.subject],
                                regions: ['Seoul'],
                            }
                        });
                        this.logger.log(`Created aggregated job: ${job.title}`);
                    }
                } catch (error) {
                    this.logger.error(`Failed to process job ${job.title}: ${error.message}`);
                }
            }

            // Soft Delete Logic
            const activeLinks = jobs.filter(j => j.link).map(j => j.link);
            if (activeLinks.length > 0) {
                await (this.prisma.jobListing as any).updateMany({
                    where: {
                        isAggregated: true,
                        isDeleted: false,
                        externalSourceUrl: {
                            contains: 'sen.go.kr', // Target only Seoul jobs
                            notIn: activeLinks
                        }
                    },
                    data: {
                        isDeleted: true
                    }
                });
                this.logger.log('Soft deleted missing jobs.');
            }

            this.logger.log('Seoul Job Sync Completed.');
        } catch (error) {
            this.logger.error(`Sync Job Failed: ${error.message}`);
        }
    }

    generateFingerprint(data: any): string {
        const raw = `${data.schoolName}|${data.subject}|${data.date}`;
        return crypto.createHash('md5').update(raw).digest('hex');
    }
}
