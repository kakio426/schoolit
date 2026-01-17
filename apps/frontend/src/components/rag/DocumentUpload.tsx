'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileText, Check, AlertCircle, Loader2, FileSearch } from 'lucide-react';
import { Button } from '../ui/Button';
import { extractTextFromPdf } from '../../lib/pdf-parser';

interface UploadedFile {
    name: string;
    status: 'parsing' | 'uploading' | 'success' | 'error';
    chunksCreated?: number;
    error?: string;
}

interface DocumentUploadProps {
    onUploadComplete?: (files: UploadedFile[]) => void;
}

export function DocumentUpload({ onUploadComplete }: DocumentUploadProps) {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const updateFileStatus = (name: string, status: UploadedFile['status'], error?: string, chunks?: number) => {
        setFiles(prev => prev.map(f => f.name === name ? { ...f, status, error, chunksCreated: chunks } : f));
    };

    const processFile = async (file: File) => {
        try {
            // 1. Parsing Phase (Client-side)
            updateFileStatus(file.name, 'parsing');
            const text = await extractTextFromPdf(file);

            if (!text || text.trim().length === 0) {
                throw new Error('PDF에서 텍스트를 추출할 수 없습니다.');
            }

            // 2. Upload Phase (Text Payload)
            updateFileStatus(file.name, 'uploading');

            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/rag/upload`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    content: text,
                    filename: file.name
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || '업로드 실패');
            }

            const data = await res.json();
            updateFileStatus(file.name, 'success', undefined, data.chunksCreated);
            return { name: file.name, status: 'success' as const, chunksCreated: data.chunksCreated };

        } catch (error) {
            const errMsg = error instanceof Error ? error.message : '알 수 없는 오류';
            updateFileStatus(file.name, 'error', errMsg);
            return { name: file.name, status: 'error' as const, error: errMsg };
        }
    };

    const handleFiles = useCallback(async (fileList: FileList) => {
        const pdfFiles = Array.from(fileList).filter(
            (f) => f.type === 'application/pdf'
        );

        if (pdfFiles.length === 0) {
            alert('PDF 파일만 업로드 가능합니다.');
            return;
        }

        // Initialize files with 'parsing' status
        const newFiles: UploadedFile[] = pdfFiles.map((f) => ({
            name: f.name,
            status: 'parsing' as const,
        }));
        setFiles((prev) => [...prev, ...newFiles]);

        // Process files sequentially
        const results: UploadedFile[] = [];
        for (const file of pdfFiles) {
            const result = await processFile(file);
            results.push(result);
        }

        onUploadComplete?.(results);
    }, [onUploadComplete]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFiles(e.target.files);
        }
    };

    const successCount = files.filter((f) => f.status === 'success').length;
    const totalChunks = files.reduce((sum, f) => sum + (f.chunksCreated || 0), 0);

    return (
        <div className="space-y-4">
            {/* Drop Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
          border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragging
                        ? 'border-primary bg-primary/5 scale-[1.02]'
                        : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50'
                    }
        `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={handleInputChange}
                    className="hidden"
                />

                <Upload
                    className={`w-12 h-12 mx-auto mb-4 transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground'
                        }`}
                />

                <p className="text-lg font-medium mb-1">
                    PDF 파일을 드래그하거나 클릭하세요
                </p>
                <p className="text-sm text-muted-foreground">
                    방과후 지침, 계약 관련 문서 등을 업로드하면 AI가 학습합니다 (브라우저에서 직접 분석)
                </p>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                        <h4 className="text-sm font-medium">업로드된 문서</h4>
                        {successCount > 0 && (
                            <span className="text-xs text-muted-foreground">
                                {successCount}개 문서, {totalChunks}개 청크 생성됨
                            </span>
                        )}
                    </div>

                    <div className="bg-muted/30 rounded-xl divide-y divide-muted">
                        {files.map((file, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-3 p-3"
                            >
                                <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                                <span className="flex-1 text-sm truncate">{file.name}</span>

                                {file.status === 'parsing' && (
                                    <div className="flex items-center gap-1 text-primary">
                                        <FileSearch className="w-4 h-4 animate-pulse" />
                                        <span className="text-xs">분석 중...</span>
                                    </div>
                                )}
                                {file.status === 'uploading' && (
                                    <div className="flex items-center gap-1 text-primary">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="text-xs">저장 중...</span>
                                    </div>
                                )}
                                {file.status === 'success' && (
                                    <div className="flex items-center gap-1 text-success">
                                        <Check className="w-4 h-4" />
                                        <span className="text-xs">{file.chunksCreated}개 청크</span>
                                    </div>
                                )}
                                {file.status === 'error' && (
                                    <div className="flex items-center gap-1 text-error">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="text-xs">{file.error}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
