'use client';

import React, { useState, useEffect, ReactElement } from 'react';
import { FileText, Download, Eye, Loader2 } from 'lucide-react';

interface PDFDownloadButtonProps {
    document: ReactElement;
    fileName: string;
    label?: string;
    showPreview?: boolean;
}

// Lazy-load react-pdf components only on client side
let PDFDownloadLinkComponent: any = null;
let BlobProviderComponent: any = null;

export default function PDFDownloadButton({
    document,
    fileName,
    label = 'PDF 다운로드',
    showPreview = true,
}: PDFDownloadButtonProps) {
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsClient(true);
        // Dynamically import react-pdf only on client
        import('@react-pdf/renderer').then((mod) => {
            PDFDownloadLinkComponent = mod.PDFDownloadLink;
            BlobProviderComponent = mod.BlobProvider;
            setIsLoading(false);
        }).catch((err) => {
            console.error('Failed to load PDF renderer:', err);
            setIsLoading(false);
        });
    }, []);

    if (!isClient || isLoading) {
        return (
            <div className="flex gap-2">
                <button
                    disabled
                    className="flex items-center gap-2 px-4 py-3 bg-slate-300 text-slate-600 rounded-xl font-bold cursor-not-allowed"
                >
                    <Loader2 className="w-4 h-4 animate-spin" />
                    PDF 엔진 로딩 중...
                </button>
            </div>
        );
    }

    if (!PDFDownloadLinkComponent) {
        return (
            <div className="flex gap-2">
                <button
                    disabled
                    className="flex items-center gap-2 px-4 py-3 bg-red-100 text-red-600 rounded-xl font-bold cursor-not-allowed"
                >
                    PDF 엔진 로드 실패
                </button>
            </div>
        );
    }

    return (
        <div className="flex gap-2">
            {/* Download Button */}
            <PDFDownloadLinkComponent
                document={document}
                fileName={fileName}
                className="flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-xl font-bold shadow-lg hover:bg-primary/90 transition-all active:scale-95"
            >
                {({ loading }: { loading: boolean }) =>
                    loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            생성 중...
                        </>
                    ) : (
                        <>
                            <Download className="w-4 h-4" />
                            {label}
                        </>
                    )
                }
            </PDFDownloadLinkComponent>

            {/* Preview Button */}
            {showPreview && (
                <button
                    type="button"
                    onClick={() => setShowPreviewModal(true)}
                    className="flex items-center gap-2 px-4 py-3 bg-surface border border-border text-foreground rounded-xl font-bold hover:bg-surface-hover transition-all"
                >
                    <Eye className="w-4 h-4" />
                    미리보기
                </button>
            )}

            {/* Preview Modal */}
            {showPreviewModal && BlobProviderComponent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-surface rounded-3xl shadow-2xl w-[90vw] h-[90vh] max-w-4xl flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" />
                                <span className="font-bold">{fileName}</span>
                            </div>
                            <button
                                onClick={() => setShowPreviewModal(false)}
                                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                닫기
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <BlobProviderComponent document={document}>
                                {({ url, loading, error }: { url: string | null; loading: boolean; error: Error | null }) => {
                                    if (loading) {
                                        return (
                                            <div className="flex items-center justify-center h-full">
                                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                                <span className="ml-2">PDF 생성 중...</span>
                                            </div>
                                        );
                                    }
                                    if (error) {
                                        return (
                                            <div className="flex items-center justify-center h-full text-red-500">
                                                PDF 생성 오류: {error.message}
                                            </div>
                                        );
                                    }
                                    return (
                                        <iframe
                                            src={url || ''}
                                            className="w-full h-full border-0"
                                            title="PDF Preview"
                                        />
                                    );
                                }}
                            </BlobProviderComponent>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
