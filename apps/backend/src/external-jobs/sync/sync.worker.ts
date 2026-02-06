
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

    @Cron(CronExpression.EVERY_2_HOURS)
    async syncAllExternalJobs() {
        this.logger.log('Starting full external job synchronization...');

        const tasks = [
            { name: 'Edurecruit-Seoul', fn: () => this.scraperService.scrapeEdurecruit('B10'), id: 'edurecruit.go.kr/B10' },
            { name: 'Edurecruit-Gyeonggi', fn: () => this.scraperService.scrapeEdurecruit('J10'), id: 'edurecruit.go.kr/J10' },
            { name: 'Edurecruit-Incheon', fn: () => this.scraperService.scrapeEdurecruit('E10'), id: 'edurecruit.go.kr/E10' },
            { name: 'Neulbom Hub', fn: () => this.scraperService.scrapeNeulbomHub(), id: 'neulbomhub.kosac.re.kr' },
            { name: 'Seoul OE (Legacy/Backup)', fn: () => this.scraperService.scrapeSeoul(), id: 'sen.go.kr' }
        ];

        const stats = { totalFound: 0, newCreated: 0, errors: 0 };

        for (const task of tasks) {
            const taskStats = await this.syncSource(task.name, task.fn, task.id);
            if (taskStats) {
                stats.totalFound += taskStats.found;
                stats.newCreated += taskStats.created;
                stats.errors += taskStats.errors;
            }
        }

        this.logger.log(`Full synchronization completed. Stats: ${JSON.stringify(stats)}`);
        return stats;
    }

    async syncSeoulJobs() {
        return this.syncSource('Seoul OE', () => this.scraperService.scrapeSeoul(), 'sen.go.kr');
    }

    async syncSource(sourceName: string, scraperFn: () => Promise<any[]>, sourceIdentifier: string) {
        const stats = { found: 0, created: 0, errors: 0 };
        try {
            this.logger.log(`[${sourceName}] Starting Sync...`);
            const jobs = await scraperFn();

            if (!jobs || jobs.length === 0) {
                this.logger.warn(`[${sourceName}] No jobs found or scraper returned empty.`);
                return stats;
            }
            stats.found = jobs.length;

            for (const job of jobs) {
                try {
                    // Check existence by URL
                    const existingUrl = await this.prisma.jobListing.findFirst({
                        where: { externalSourceUrl: job.link }
                    });
                    if (existingUrl) continue;

                    // Fetch detail and extract via AI
                    const detail = await this.scraperService.scrapeDetail(job.link);

                    // If content is too short or empty, skip AI to save cost but create basic record or skip
                    if (detail.content.length < 10 && job.title.length < 5) continue;

                    const extracted = await this.aiParserService.parseJobPost(`${job.title}\n${detail.content}`);

                    const mergedData = {
                        ...job,
                        schoolName: extracted.schoolName || '정보 없음',
                        subject: extracted.subject || '전과목',
                        closingDate: extracted.closingDate
                    };

                    const fingerprint = this.generateFingerprint(mergedData);

                    // Final check with fingerprint
                    const existing = await this.prisma.jobListing.findUnique({ where: { fingerprint } });

                    if (!existing) {
                        await this.prisma.jobListing.create({
                            data: {
                                title: job.title,
                                description: detail.content || job.title,
                                externalSourceUrl: job.link,
                                isAggregated: true,
                                externalSource: sourceName,
                                fingerprint,
                                subjects: mergedData.subject ? [mergedData.subject] : [],
                                regions: this.mapRegionFromSource(sourceName),
                                status: 'OPEN',
                                active: true,
                                isDeleted: false,
                                createdAt: new Date().toISOString()
                            }
                        });
                        this.logger.log(`[${sourceName}] Successfully created aggregated job: ${job.title}`);
                        stats.created++;
                    }
                } catch (error) {
                    this.logger.error(`[${sourceName}] Error processing job ${job.title}: ${error.message}`);
                    stats.errors++;
                }
            }

            // Soft Delete logic
            const activeLinks = jobs.filter(j => j.link).map(j => j.link);
            if (activeLinks.length > 0) {
                const deletedCount = await this.prisma.jobListing.updateMany({
                    where: {
                        isAggregated: true,
                        isDeleted: false,
                        externalSourceUrl: {
                            contains: sourceIdentifier,
                            notIn: activeLinks
                        }
                    },
                    data: {
                        isDeleted: true,
                        status: 'CLOSED'
                    }
                });
                if (deletedCount.count > 0) {
                    this.logger.log(`[${sourceName}] Soft deleted ${deletedCount.count} obsolete jobs.`);
                }
            }

            this.logger.log(`[${sourceName}] Sync Completed. Created: ${stats.created}, Errors: ${stats.errors}`);
            return stats;
        } catch (error) {
            this.logger.error(`[${sourceName}] Sync Master Failed: ${error.message}`);
            return stats;
        }
    }

    private mapRegionFromSource(sourceName: string): string[] {
        if (sourceName.includes('Seoul')) return ['서울'];
        if (sourceName.includes('Gyeonggi')) return ['경기'];
        if (sourceName.includes('Incheon')) return ['인천'];
        return ['전국'];
    }

    private generateFingerprint(data: any): string {
        const raw = `${data.schoolName}|${data.subject}|${data.closingDate || 'no-date'}`;
        return crypto.createHash('md5').update(raw).digest('hex');
    }
}
