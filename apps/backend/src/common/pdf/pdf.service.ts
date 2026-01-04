import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class PdfService implements OnModuleInit, OnModuleDestroy {
    private browser: puppeteer.Browser;

    async onModuleInit() {
        this.browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'], // Recommended for Docker/Cloud environments
        });
    }

    async onModuleDestroy() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    async generatePdf(htmlContent: string): Promise<Buffer> {
        if (!this.browser) {
            await this.onModuleInit();
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
