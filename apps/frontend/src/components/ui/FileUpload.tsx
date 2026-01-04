"use client";

import React, { useState, useRef } from 'react';
import { api } from '@/lib/api';

interface FileUploadProps {
    onUploadSuccess: (data: any) => void;
    token: string | null;
}

export default function FileUpload({ onUploadSuccess, token }: FileUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.size > 5 * 1024 * 1024) {
                setError('파일 크기는 5MB 이하여야 합니다.');
                return;
            }
            setFile(selectedFile);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const data = await api.upload('/users/certifications/upload', formData);
            onUploadSuccess(data);
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err: any) {
            setError(err.message || '업로드에 실패했습니다.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${file ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary/50'
                    }`}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf"
                />

                {!file ? (
                    <div className="space-y-2">
                        <div className="text-4xl mb-2">📄</div>
                        <p className="text-slate-600 font-medium">자격증 또는 증명서를 업로드하세요</p>
                        <p className="text-xs text-slate-400">JPG, PNG, PDF (최대 5MB)</p>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-4 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10 rounded-xl transition-all"
                        >
                            파일 선택하기
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-center space-x-2 text-primary font-bold">
                            <span>{file.name}</span>
                            <button
                                onClick={() => setFile(null)}
                                className="text-slate-400 hover:text-red-500 text-sm"
                            >
                                취소
                            </button>
                        </div>
                        <button
                            onClick={handleUpload}
                            disabled={isUploading}
                            className={`px-8 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all ${isUploading ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'
                                }`}
                        >
                            {isUploading ? '업로드 중...' : '인증 요청하기'}
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <p className="text-sm text-red-500 font-medium text-center">{error}</p>
            )}
        </div>
    );
}
