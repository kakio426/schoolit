
import { ScraperService } from '../../scraper/scraper.service';
import { ConfigService } from '@nestjs/config';

describe('ScraperService', () => {
    let service: ScraperService;

    // Mock HTML content for a typical OE board list
    const mockHtmlSeoul = `
    <div class="board_list">
        <table>
            <tbody>
                <tr>
                    <td class="num">123</td>
                    <td class="subject"><a href="/view/123">Elementary Math Teacher (Fixed Term)</a></td>
                    <td class="date">2026-02-03</td>
                    <td class="views">100</td>
                </tr>
            </tbody>
        </table>
    </div>`;

    beforeEach(() => {
        service = new ScraperService(new ConfigService());
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should parse Seoul OE board list correctly', async () => {
        // Mock the internal fetch method to return our HTML
        jest.spyOn(service as any, 'fetchHtml').mockResolvedValue(mockHtmlSeoul);

        const jobs = await service.scrapeSeoul();
        expect(jobs).toHaveLength(1);
        expect(jobs[0].title).toContain('Math Teacher');
        expect(jobs[0].date).toBe('2026-02-03');
    });

    it('should handle empty or error pages gracefully', async () => {
        jest.spyOn(service as any, 'fetchHtml').mockResolvedValue('');
        const jobs = await service.scrapeSeoul();
        expect(jobs).toEqual([]);
    });

    it('should parse Detail Page correctly', async () => {
        const mockDetailHtml = `
        <div class="board_view">
            <div class="title">Math Teacher Wanted</div>
            <div class="info">
                <span>Date: 2026-02-03</span>
                <span>Views: 120</span>
            </div>
            <div class="view_cont">
                Please apply by email. 
                Requirements: ...
            </div>
        </div>`;
        jest.spyOn(service as any, 'fetchHtml').mockResolvedValue(mockDetailHtml);

        const detail = await service.scrapeDetail('http://example.com/view/123');
        expect(detail.content).toContain('Please apply by email');
        expect(detail.title).toBe('Math Teacher Wanted');
    });
});
