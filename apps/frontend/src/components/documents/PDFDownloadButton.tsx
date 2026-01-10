
'use client';

import React, { useState } from 'react';
import { FileText, Download, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface PDFDownloadButtonProps {
    type: 'hiring-plan';
    data: any;
    fileName?: string;
    label?: string;
    className?: string;
}

export default function PDFDownloadButton({
    type,
    data,
    fileName = 'document.pdf',
    label = 'PDF 다운로드',
    className = '',
}: PDFDownloadButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = async () => {
        setIsGenerating(true);
        try {
            const endpoint = type === 'hiring-plan' ? '/documents/generate/hiring-plan' : '';
            if (!endpoint) throw new Error('Invalid document type');

            const blob = await api.postBlob(endpoint, data);

            // Create blob link to download
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);

            // Append to html link element page
            document.body.appendChild(link);

            // Start download
            link.click();

            // Clean up and remove the link
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('PDF Download failed:', error);
            alert('PDF 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={isGenerating}
            className={`flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
        >
            {isGenerating ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    생성 중...
                </>
            ) : (
                <>
                    <Download className="w-5 h-5" />
                    {label}
                </>
            )}
        </button>
    );
}
