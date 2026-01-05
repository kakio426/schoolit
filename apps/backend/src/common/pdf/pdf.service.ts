import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

// Skip Puppeteer entirely in Railway/Docker to avoid native library crashes
const SKIP_PUPPETEER = process.env.SKIP_PUPPETEER === 'true' || process.env.RAILWAY_ENVIRONMENT;

@Injectable()
export class PdfService implements OnModuleInit, OnModuleDestroy {
    private browser: any = null;
    private isAvailable: boolean = false;

    async onModuleInit() {
        if (SKIP_PUPPETEER) {
            console.log('⏭️ PdfService: Puppeteer skipped (SKIP_PUPPETEER or RAILWAY_ENVIRONMENT set)');
            this.isAvailable = false;
            return;
        }

        try {
            // Dynamic import to avoid loading native libraries when skipped
            const puppeteer = await import('puppeteer');
            this.browser = await puppeteer.default.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
            });
            this.isAvailable = true;
            console.log('✅ PdfService: Puppeteer initialized successfully');
        } catch (error) {
            console.warn('⚠️ PdfService: Puppeteer not available.', error.message);
            this.isAvailable = false;
        }
    }

    async onModuleDestroy() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    async generatePdf(htmlContent: string): Promise<Buffer> {
        if (!this.isAvailable || !this.browser) {
            throw new Error('PDF generation is not available in this environment.');
        }

        const page = await this.browser.newPage();
        try {
            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '20px',
                    right: '20px',
                    bottom: '20px',
                    left: '20px',
                },
            });

            return Buffer.from(pdfBuffer);
        } finally {
            await page.close();
        }
    }
}
