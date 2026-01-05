'use client';

import { useState } from 'react';
import { X, Upload, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadConsentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (file: File) => Promise<void>;
    title?: string;
}

export default function UploadConsentModal({ isOpen, onClose, onUpload, title = "증빙 서류 안전 업로드" }: UploadConsentModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [consent, setConsent] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!file || !consent) return;
        setIsUploading(true);
        setError(null);
        try {
            await onUpload(file);
            onClose();
        } catch (err) {
            setError('업로드 중 오류가 발생했습니다.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Upload className="w-5 h-5 text-indigo-600" />
                                {title}
                            </h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-6">

                            {/* Warning/Info Box */}
                            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-3">
                                <AlertTriangle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-indigo-800">
                                    <p className="font-semibold mb-1">국외 이전 및 일시 보관 안내</p>
                                    <p className="opacity-90 leading-relaxed">
                                        선생님의 소중한 정보는 계약서 초안 작성을 위해
                                        <strong> 미국 내 보안 서버(Railway, AES-256 암호화)</strong>에
                                        <strong> 7일간만 임시 보관</strong>되며, 이후 자동 파기됩니다.
                                    </p>
                                </div>
                            </div>

                            {/* File Input */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">파일 선택</label>
                                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer group">
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                    />
                                    {file ? (
                                        <div className="text-center">
                                            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                            <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    ) : (
                                        <div className="text-center group-hover:scale-105 transition-transform">
                                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm font-medium text-gray-600">클릭하여 파일 업로드</p>
                                            <p className="text-xs text-gray-400">JPG, PNG, PDF (최대 10MB)</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Consent Checkbox */}
                            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="flex h-5 items-center">
                                    <input
                                        id="consent"
                                        type="checkbox"
                                        checked={consent}
                                        onChange={(e) => setConsent(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                </div>
                                <label htmlFor="consent" className="text-sm text-gray-600 select-none cursor-pointer">
                                    위 내용을 충분히 이해하였으며, 에듀핀의 <span className="underline">개인정보 국외 이전 및 처리 방침</span>에 동의합니다.
                                </label>
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm text-center">{error}</p>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!file || !consent || isUploading}
                                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2
                  ${(!file || !consent || isUploading) ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-md'}
                `}
                            >
                                {isUploading ? '보안 전송 중...' : '동의하고 업로드'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
