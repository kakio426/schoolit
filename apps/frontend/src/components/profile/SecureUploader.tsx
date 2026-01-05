'use client';

import { useState, useEffect } from 'react';
import { Upload, FileText, Clock, Trash2, ShieldCheck, Lock } from 'lucide-react';
import UploadConsentModal from '../ui/UploadConsentModal';

interface SecureFile {
    id: string; // or category
    name: string;
    url?: string;
    expirationDate?: string; // ISO string
    isUploaded: boolean;
}

interface SecureUploaderProps {
    files: SecureFile[];
    onUpload: (category: string, file: File) => Promise<any>;
    onRemove: (category: string) => Promise<void>;
}

export default function SecureUploader({ files, onUpload, onRemove }: SecureUploaderProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const handleUploadClick = (category: string) => {
        setSelectedCategory(category);
        setModalOpen(true);
    };

    const handleModalUpload = async (file: File) => {
        if (selectedCategory) {
            await onUpload(selectedCategory, file);
        }
    };

    const calculateDaysLeft = (dateStr?: string) => {
        if (!dateStr) return 0;
        const exp = new Date(dateStr);
        const now = new Date();
        const diff = exp.getTime() - now.getTime();
        return Math.ceil(diff / (1000 * 3600 * 24));
    };

    return (
        <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30 p-6 space-y-4">
            <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                    <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                    <h3 className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                        보안 증빙 업로드 (Yellow Zone)
                        <span className="text-xs bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-full">암호화 저장</span>
                    </h3>
                    <p className="text-sm text-amber-600/80 dark:text-amber-400/80 mt-1">
                        행정 편의를 위해 미리 제출하는 서류입니다. <br />
                        <strong>미국 보안 서버에 7일간 일시 보관</strong>되며, 이후 자동 파기되므로 안심하세요.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {files.map((file) => {
                    const daysLeft = calculateDaysLeft(file.expirationDate);
                    const isExpired = file.isUploaded && daysLeft <= 0;

                    return (
                        <div
                            key={file.id}
                            className={`relative p-4 rounded-xl border-2 transition-all group
                  ${file.isUploaded && !isExpired
                                    ? 'bg-white border-green-200 shadow-sm'
                                    : 'bg-white/50 border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/50'
                                }`}
                        >
                            {/* Status Badge */}
                            <div className="flex justify-between items-start mb-3">
                                <div className="p-2 rounded-lg bg-gray-100">
                                    {file.isUploaded ? <FileText className="w-5 h-5 text-indigo-600" /> : <Lock className="w-5 h-5 text-gray-400" />}
                                </div>
                                {file.isUploaded && !isExpired && (
                                    <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                                        <Clock className="w-3 h-3" />
                                        {daysLeft}일 남음
                                    </div>
                                )}
                            </div>

                            <h4 className="font-bold text-gray-800 mb-1">{file.name}</h4>

                            {file.isUploaded && !isExpired ? (
                                <div className="text-xs text-gray-500 flex justify-between items-end mt-2">
                                    <span>보안 보관 중</span>
                                    <button
                                        onClick={() => onRemove(file.id)}
                                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="삭제"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-4">
                                    <button
                                        onClick={() => handleUploadClick(file.id)}
                                        className="w-full py-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Upload className="w-4 h-4" />
                                        업로드
                                    </button>
                                </div>
                            )}

                            {isExpired && (
                                <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center rounded-xl">
                                    <span className="text-xs font-bold text-red-500 bg-red-100 px-3 py-1 rounded-full">만료됨 (재업로드 필요)</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <UploadConsentModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onUpload={handleModalUpload}
                title={files.find(f => f.id === selectedCategory)?.name}
            />
        </div>
    );
}
