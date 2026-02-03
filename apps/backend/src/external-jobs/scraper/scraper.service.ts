
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cheerio from 'cheerio';

export interface BoardConfig {
    listSelector: string;
    rowSelector: string;
    titleSelector: string;
    dateSelector: string;
    linkSelector: string;
}

@Injectable()
export class ScraperService {
    constructor(private readonly configService: ConfigService) { }

    async scrapeSeoul(): Promise<any[]> {
        return this.scrapeBoard(
            'https://www.sen.go.kr/web/services/bbs/bbsList.action?bbsBean.bbsCd=72',
            {
                listSelector: '.board_list table tbody', // Not used directly in loop but good for context
                rowSelector: '.board_list table tbody tr',
                titleSelector: 'td.subject a',
                dateSelector: 'td.date',
                linkSelector: 'td.subject a' // often same as title
            }
        );
    }

    async scrapeBoard(url: string, config: BoardConfig): Promise<any[]> {
        const html = await this.fetchHtml(url);
        const $ = cheerio.load(html);
        const jobs = [];

        $(config.rowSelector).each((i, el) => {
            const $el = $(el);
            const titleEl = $el.find(config.titleSelector);
            if (titleEl.length === 0) return;

            const title = titleEl.text().trim();
            const rawLink = titleEl.attr('href');
            // Resolve relative URL
            const link = rawLink ? new URL(rawLink, url).toString() : '';

            const date = $el.find(config.dateSelector).text().trim();

            if (title && link) {
                jobs.push({ title, link, date });
            }
        });

        return jobs;
    }

    async scrapeDetail(url: string): Promise<any> {
        const html = await this.fetchHtml(url);
        const $ = cheerio.load(html);

        const title = $('.board_view .title').text().trim();
        const content = $('.board_view .view_cont').text().trim();
        const dateText = $('.board_view .info').text(); // Naive extraction, better selectors needed in real world

        return {
            title,
            content,
            dateText // Just raw text for now, AI will parse later
        };
    }

    protected async fetchHtml(url: string): Promise<string> {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        if (!response.ok) {
            // Log error but don't throw to avoid stopping the whole scraper if one page fails? 
            // Or throw to let caller handle. Throwing is safer for now.
            throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
        }
        return response.text();
    }
}
