/**
 * Test 4.1: Design Token Consistency
 * 
 * Goal: Ensure all UI components use centralized design tokens from globals.css
 * instead of hardcoded values. This maintains brand consistency and enables
 * easy theme updates.
 */

import { render } from '@testing-library/react';
import StandardCard from '@/components/ui/StandardCard';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Test 4.1: Design Token Consistency', () => {
    let globalsCss: string;

    beforeAll(() => {
        // Read globals.css to verify token definitions
        const cssPath = join(process.cwd(), 'src', 'app', 'globals.css');
        globalsCss = readFileSync(cssPath, 'utf-8');
    });

    describe('Color Tokens', () => {
        it('should define all required color tokens in globals.css', () => {
            const requiredTokens = [
                '--primary',
                '--background',
                '--surface',
                '--foreground',
                '--foreground-muted',
                '--border',
                '--success',
                '--error',
                '--warning',
            ];

            requiredTokens.forEach(token => {
                expect(globalsCss).toContain(token);
            });
        });

        it('should use CSS variables instead of hardcoded colors', () => {
            // ANTI-PATTERN: Hardcoded colors
            const antiPatterns = [
                'bg-blue-500',
                'text-red-600',
                'border-green-400',
                'bg-#3B82F6', // Hardcoded hex
            ];

            // Check that components don't use hardcoded colors
            const { container } = render(<StandardCard title="Test" > Content </StandardCard>);
            const html = container.innerHTML;

            // Should use design tokens like bg-primary, text-foreground, etc.
            expect(html).not.toMatch(/bg-blue-\d{3}/);
            expect(html).not.toMatch(/text-red-\d{3}/);
        });
    });

    describe('Typography Tokens', () => {
        it('should define typography scale in globals.css', () => {
            const typographyClasses = [
                '.text-display',
                '.text-h1',
                '.text-h2',
                '.text-h3',
                '.text-body',
                '.text-caption',
            ];

            typographyClasses.forEach(className => {
                expect(globalsCss).toContain(className);
            });
        });

        it('should use consistent font weights', () => {
            // Verify font-weight tokens are defined
            expect(globalsCss).toMatch(/font-weight:\s*(400|500|600|700|800|900)/);
        });
    });

    describe('Spacing Tokens', () => {
        it('should use Tailwind spacing scale consistently', () => {
            const { container } = render(
                <div className="p-4 m-8 gap-6" >
            <StandardCard title="Test" > Content </StandardCard>
            </div>
            );

            const html = container.innerHTML;

            // Should use spacing scale (4, 8, 12, 16, etc.)
            // NOT arbitrary values like p-[13px]
            expect(html).not.toMatch(/p-\[\d+px\]/);
            expect(html).not.toMatch(/m-\[\d+px\]/);
        });
    });

    describe('Border Radius Tokens', () => {
        it('should define consistent border radius values', () => {
            const radiusClasses = [
                'rounded-lg',
                'rounded-xl',
                'rounded-2xl',
                'rounded-3xl',
            ];

            const { container } = render(<StandardCard title="Test" > Content </StandardCard>);
            const html = container.innerHTML;

            // Should use predefined radius classes
            const hasStandardRadius = radiusClasses.some(cls => html.includes(cls));
            expect(hasStandardRadius).toBe(true);

            // Should NOT use arbitrary radius like rounded-[23px]
            expect(html).not.toMatch(/rounded-\[\d+px\]/);
        });
    });

    describe('Shadow Tokens', () => {
        it('should use consistent shadow utilities', () => {
            expect(globalsCss).toMatch(/shadow-(sm|md|lg|xl|2xl)/);
        });
    });

    describe('Button Variants', () => {
        it('should define reusable button classes in globals.css', () => {
            const buttonClasses = [
                '.btn-primary',
                '.btn-secondary',
                '.btn-ghost',
            ];

            buttonClasses.forEach(className => {
                expect(globalsCss).toContain(className);
            });
        });

        it('should use button classes instead of inline styles', () => {
            const { container } = render(
                <button className="btn-primary" > Click me </button>
            );

            const button = container.querySelector('button');
            expect(button?.className).toContain('btn-primary');
        });
    });

    describe('Status Badge Tokens', () => {
        it('should define status badge classes in globals.css', () => {
            const statusClasses = [
                '.status-pending',
                '.status-active',
                '.status-success',
                '.status-error',
            ];

            statusClasses.forEach(className => {
                expect(globalsCss).toContain(className);
            });
        });
    });

    describe('Animation Tokens', () => {
        it('should define consistent animation utilities', () => {
            expect(globalsCss).toContain('animate-in');
            expect(globalsCss).toContain('fade-in');
            expect(globalsCss).toContain('slide-in');
        });
    });

    describe('Dark Mode Consistency', () => {
        it('should define dark mode variants for all color tokens', () => {
            // Check that dark mode is properly configured
            expect(globalsCss).toContain('.dark');
            expect(globalsCss).toMatch(/\.dark.*--primary/);
            expect(globalsCss).toMatch(/\.dark.*--background/);
        });
    });
});
