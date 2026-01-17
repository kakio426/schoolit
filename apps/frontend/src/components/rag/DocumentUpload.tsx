'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileText, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface UploadedFile {
    name: string;
    status: 'uploading' | 'success' | 'error';
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

    const uploadFile = async (file: File): Promise<UploadedFile> => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/rag/upload`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || '업로드 실패');
            }

            const data = await res.json();
            return {
                name: file.name,
                status: 'success',
                chunksCreated: data.chunksCreated,
            };
        } catch (error) {
            return {
                name: file.name,
                status: 'error',
                error: error instanceof Error ? error.message : '알 수 없는 오류',
            };
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

        // Add files with uploading status
        const newFiles: UploadedFile[] = pdfFiles.map((f) => ({
            name: f.name,
            status: 'uploading' as const,
        }));
        setFiles((prev) => [...prev, ...newFiles]);

        // Upload files sequentially
        const results: UploadedFile[] = [];
        for (let i = 0; i < pdfFiles.length; i++) {
            const result = await uploadFile(pdfFiles[i]);
            results.push(result);

            // Update specific file status
            setFiles((prev) =>
                prev.map((f) => (f.name === result.name ? result : f))
            );
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
                    방과후 지침, 계약 관련 문서 등을 업로드하면 AI가 학습합니다
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

                                {file.status === 'uploading' && (
                                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
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
