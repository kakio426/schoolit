'use client';

import React, { useState } from 'react';
import { FileText, Download, Eye, ZoomIn, ZoomOut, X, ExternalLink } from 'lucide-react';

interface EstimatePreviewProps {
    fileUrl: string;
    fileName?: string;
    fileType?: 'pdf' | 'image';
    cost?: number;
    submittedAt?: string;
    vendorName?: string;
}

export default function EstimatePreview({
    fileUrl,
    fileName = '견적서',
    fileType = 'pdf',
    cost,
    submittedAt,
    vendorName,
}: EstimatePreviewProps) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [zoom, setZoom] = useState(100);

    const isPdf = fileType === 'pdf' || fileUrl.toLowerCase().endsWith('.pdf');

    return (
        <>
            {/* Compact Preview Card */}
            <div className="bg-surface rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow group">
                {/* Preview Thumbnail */}
                <div
                    className="relative h-48 bg-slate-100 dark:bg-slate-800 flex items-center justify-center cursor-pointer"
                    onClick={() => setIsFullscreen(true)}
                >
                    {isPdf ? (
                        <div className="flex flex-col items-center gap-2 text-foreground-muted">
                            <FileText className="w-16 h-16 opacity-50" />
                            <span className="text-sm font-bold">PDF 문서</span>
                        </div>
                    ) : (
                        <img
                            src={fileUrl}
                            alt={fileName}
                            className="w-full h-full object-cover"
                        />
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button className="px-4 py-2 bg-white/90 rounded-xl font-bold text-sm text-slate-800 flex items-center gap-2">
                            <Eye className="w-4 h-4" /> 미리보기
                        </button>
                    </div>
                </div>

                {/* Info Footer */}
                <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground truncate max-w-[150px]">{fileName}</span>
                        {cost && (
                            <span className="text-lg font-black text-primary">
                                {cost.toLocaleString()}원
                            </span>
                        )}
                    </div>

                    {(vendorName || submittedAt) && (
                        <div className="text-xs text-foreground-muted flex justify-between">
                            {vendorName && <span>{vendorName}</span>}
                            {submittedAt && <span>{new Date(submittedAt).toLocaleDateString()}</span>}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsFullscreen(true)}
                            className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-sm text-foreground-muted hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1"
                        >
                            <Eye className="w-4 h-4" /> 보기
                        </button>
                        <a
                            href={fileUrl}
                            download
                            className="flex-1 py-2 bg-primary/10 rounded-xl font-bold text-sm text-primary hover:bg-primary/20 transition-colors flex items-center justify-center gap-1"
                        >
                            <Download className="w-4 h-4" /> 다운로드
                        </a>
                    </div>
                </div>
            </div>

            {/* Fullscreen Modal */}
            {isFullscreen && (
                <div className="fixed inset-0 z-50 bg-black/90 flex flex-col animate-in fade-in duration-200">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-white" />
                            <span className="font-bold text-white">{fileName}</span>
                            {cost && (
                                <span className="px-3 py-1 bg-primary rounded-lg text-white font-bold text-sm">
                                    {cost.toLocaleString()}원
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Zoom Controls (for images) */}
                            {!isPdf && (
                                <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
                                    <button
                                        onClick={() => setZoom(z => Math.max(50, z - 25))}
                                        className="p-2 hover:bg-white/10 rounded"
                                    >
                                        <ZoomOut className="w-4 h-4 text-white" />
                                    </button>
                                    <span className="text-white text-sm font-bold px-2">{zoom}%</span>
                                    <button
                                        onClick={() => setZoom(z => Math.min(200, z + 25))}
                                        className="p-2 hover:bg-white/10 rounded"
                                    >
                                        <ZoomIn className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                            )}
                            <a
                                href={fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 hover:bg-white/10 rounded-lg"
                            >
                                <ExternalLink className="w-5 h-5 text-white" />
                            </a>
                            <a
                                href={fileUrl}
                                download
                                className="p-2 hover:bg-white/10 rounded-lg"
                            >
                                <Download className="w-5 h-5 text-white" />
                            </a>
                            <button
                                onClick={() => setIsFullscreen(false)}
                                className="p-2 hover:bg-white/10 rounded-lg"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-auto flex items-center justify-center p-4">
                        {isPdf ? (
                            <iframe
                                src={fileUrl}
                                className="w-full max-w-4xl h-full rounded-lg bg-white"
                                title={fileName}
                            />
                        ) : (
                            <img
                                src={fileUrl}
                                alt={fileName}
                                style={{ transform: `scale(${zoom / 100})` }}
                                className="max-w-full max-h-full object-contain transition-transform"
                            />
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
