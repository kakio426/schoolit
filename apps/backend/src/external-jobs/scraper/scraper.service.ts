
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

    // Constants for known 2026 essential sources
    private readonly SOURCES = {
        SEOUL_OE: {
            url: 'https://edurecruit.go.kr/rec/scr/recruitment/list.do?offcCd=B10',
            config: {
                listSelector: '.board_list tbody, .bbs_list tbody, table tbody',
                rowSelector: 'tr',
                titleSelector: '.subject a, .title a, a[href*="view"]',
                dateSelector: '.date, .reg_date, td:nth-last-child(2)',
                linkSelector: 'a'
            }
        },
        NEULBOM_HUB: {
            url: 'https://neulbomhub.kosac.re.kr/neulbom/bbs/BBSMSTR_000000000001/selectBoardList.do',
            config: {
                listSelector: '.board_list tbody, table tbody',
                rowSelector: 'tr',
                titleSelector: '.title a, .subject a, a',
                dateSelector: '.date, td:nth-last-child(1)',
                linkSelector: 'a'
            }
        }
    };

    async scrapeSeoul(): Promise<any[]> {
        return this.scrapeSource('SEOUL_OE');
    }

    async scrapeEdurecruit(regionCode: string): Promise<any[]> {
        const url = `https://edurecruit.go.kr/rec/scr/recruitment/list.do?offcCd=${regionCode}`;
        return this.scrapeBoard(url, this.SOURCES.SEOUL_OE.config);
    }

    async scrapeNeulbomHub(): Promise<any[]> {
        return this.scrapeSource('NEULBOM_HUB');
    }

    private async scrapeSource(key: keyof typeof this.SOURCES): Promise<any[]> {
        const source = this.SOURCES[key];
        try {
            return await this.scrapeBoard(source.url, source.config);
        } catch (e) {
            console.error(`Scraping ${key} failed: ${e.message}`);
            return [];
        }
    }

    async scrapeBoard(url: string, config: BoardConfig): Promise<any[]> {
        const html = await this.fetchHtml(url);
        const $ = cheerio.load(html);
        const jobs = [];

        const rows = $(config.listSelector).find(config.rowSelector);

        rows.each((i, el) => {
            const $el = $(el);
            const titleEl = $el.find(config.titleSelector).first();
            if (titleEl.length === 0) return;

            const title = titleEl.text().trim();
            const rawLink = titleEl.attr('href');
            if (!rawLink || rawLink.startsWith('javascript:')) return;

            // Resolve relative URL
            const link = new URL(rawLink, url).toString();
            const date = $el.find(config.dateSelector).text().trim();

            if (title && link) {
                jobs.push({ title, link, date });
            }
        });

        return jobs;
    }

    async scrapeDetail(url: string): Promise<any> {
        try {
            const html = await this.fetchHtml(url);
            const $ = cheerio.load(html);

            // Robust detail selectors
            const title = $('.board_view .title, .view_title, .subject, h2, h3').first().text().trim();
            const content = $('.board_view .view_cont, .view_content, .bbs_content, #content, .cont').text().trim();
            const dateText = $('.board_view .info, .view_info, .date').text().trim();

            return {
                title: title || 'No Title',
                content: content || 'No Content',
                dateText
            };
        } catch (e) {
            return { title: '', content: '', dateText: '' };
        }
    }

    protected async fetchHtml(url: string): Promise<string> {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} for ${url}`);
        }
        return response.text();
    }
}
