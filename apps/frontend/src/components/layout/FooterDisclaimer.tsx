import React from 'react';
import { LEGAL_TEXT } from '@/lib/constants';

// Phase 1: Global Safety Layer - Footer Disclaimer
export default function FooterDisclaimer() {
    return (
        <footer className="w-full py-8 px-6 mt-12 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <div className="max-w-4xl mx-auto text-center space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {LEGAL_TEXT.DISCLAIMER_TITLE}
                </h4>
                <p className="text-xs text-slate-400 break-keep leading-relaxed text-balance">
                    {LEGAL_TEXT.DISCLAIMER_BODY}
                </p>
                <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/50 w-20 mx-auto"></div>
                <div className="flex justify-center gap-6 text-[10px] md:text-xs font-medium text-slate-400">
                    <a href="/terms" className="hover:text-primary transition-colors">이용약관</a>
                    <a href="/privacy" className="hover:text-primary transition-colors">개인정보처리방침</a>
                </div>
                <p className="text-[10px] text-slate-300 dark:text-slate-600 font-mono">
                    {LEGAL_TEXT.COPYRIGHT}
                </p>
            </div>
        </footer>
    );
}
