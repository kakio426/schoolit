import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class PdfService implements OnModuleInit, OnModuleDestroy {
    private browser: puppeteer.Browser | null = null;
    private isAvailable: boolean = false;

    async onModuleInit() {
        try {
            this.browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
            });
            this.isAvailable = true;
            console.log('✅ PdfService: Puppeteer initialized successfully');
        } catch (error) {
            console.warn('⚠️ PdfService: Puppeteer not available. HTML-to-PDF feature disabled.', error.message);
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
