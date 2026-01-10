'use client';

import React, { useState } from 'react';
import StandardCard from '@/components/ui/StandardCard';
import { X, Database, Copy, Check, AlertCircle, Search } from 'lucide-react';

interface NEISDataModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDataExtracted?: (data: NEISExtractedData) => void;
}

interface NEISExtractedData {
    schoolCode: string;
    schoolName: string;
    teacherName: string;
    salaryStep: number;
    startDate: string;
    endDate: string;
    subjects: string[];
}

export default function NEISDataModal({
    isOpen,
    onClose,
    onDataExtracted
}: NEISDataModalProps) {
    const [rawData, setRawData] = useState('');
    const [extractedData, setExtractedData] = useState<NEISExtractedData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const parseNEISData = () => {
        setError(null);
        setExtractedData(null);

        if (!rawData.trim()) {
            setError('데이터를 입력해주세요.');
            return;
        }

        try {
            // Try to parse common NEIS copy-paste formats
            const lines = rawData.split('\n').map(l => l.trim()).filter(Boolean);

            // Pattern matching for common fields
            let schoolCode = '';
            let schoolName = '';
            let teacherName = '';
            let salaryStep = 0;
            let startDate = '';
            let endDate = '';
            const subjects: string[] = [];

            for (const line of lines) {
                // 학교코드 patterns: "학교코드: B123456", "학교코드	B123456"
                if (line.includes('학교코드') || line.includes('기관코드')) {
                    const match = line.match(/[A-Z]\d{6,}/);
                    if (match) schoolCode = match[0];
                }

                // 학교명 patterns
                if (line.includes('학교명') || line.includes('기관명')) {
                    const parts = line.split(/[:：\t]/);
                    if (parts.length > 1) schoolName = parts[1].trim();
                }

                // 이름 patterns
                if (line.includes('성명') || line.includes('이름') || line.includes('교사명')) {
                    const parts = line.split(/[:：\t]/);
                    if (parts.length > 1) teacherName = parts[1].trim();
                }

                // 호봉 patterns
                if (line.includes('호봉')) {
                    const match = line.match(/(\d{1,2})호봉/);
                    if (match) salaryStep = parseInt(match[1]);
                }

                // Date patterns (YYYY.MM.DD or YYYY-MM-DD)
                const dateMatches = line.match(/\d{4}[.-]\d{2}[.-]\d{2}/g);
                if (dateMatches && dateMatches.length >= 2) {
                    startDate = dateMatches[0].replace(/\./g, '-');
                    endDate = dateMatches[1].replace(/\./g, '-');
                } else if (dateMatches && dateMatches.length === 1) {
                    if (!startDate) startDate = dateMatches[0].replace(/\./g, '-');
                    else if (!endDate) endDate = dateMatches[0].replace(/\./g, '-');
                }

                // 과목 patterns
                if (line.includes('과목') || line.includes('담당교과')) {
                    const parts = line.split(/[:：\t]/);
                    if (parts.length > 1) {
                        const subj = parts[1].trim().split(/[,，\s]+/).filter(Boolean);
                        subjects.push(...subj);
                    }
                }
            }

            // Validate minimum required fields
            if (!schoolName && !teacherName) {
                setError('NEIS 데이터 형식을 인식할 수 없습니다. 복사한 내용을 확인해주세요.');
                return;
            }

            const data: NEISExtractedData = {
                schoolCode: schoolCode || '미확인',
                schoolName: schoolName || '미확인',
                teacherName: teacherName || '미확인',
                salaryStep: salaryStep || 0,
                startDate: startDate || '',
                endDate: endDate || '',
                subjects: subjects.length > 0 ? subjects : ['미확인']
            };

            setExtractedData(data);

        } catch (e) {
            setError('데이터 파싱 중 오류가 발생했습니다.');
            console.error(e);
        }
    };

    const handleApply = () => {
        if (extractedData && onDataExtracted) {
            onDataExtracted(extractedData);
            onClose();
        }
    };

    const handleCopyTemplate = () => {
        const template = `학교코드: (예: B123456)
학교명: (예: OO초등학교)
성명: (예: 홍길동)
호봉: (예: 7호봉)
계약기간: 2025-03-01 ~ 2025-08-31
담당교과: 국어, 수학`;

        navigator.clipboard.writeText(template);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <StandardCard className="w-full max-w-xl shadow-2xl" noPadding>
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-5 flex justify-between items-start rounded-t-2xl">
                    <div>
                        <div className="flex items-center gap-2 mb-1 opacity-80">
                            <Database className="w-4 h-4" />
                            <span className="text-xs font-bold tracking-widest uppercase">NEIS DATA IMPORT</span>
                        </div>
                        <h2 className="text-lg font-black">NEIS 데이터 추출</h2>
                        <p className="text-xs text-white/70 mt-1">NEIS에서 복사한 데이터를 붙여넣어 자동으로 채용 정보를 입력합니다.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Instructions */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-4">
                        <h4 className="font-bold text-sm text-blue-800 dark:text-blue-300 mb-2">
                            📋 사용 방법
                        </h4>
                        <ol className="text-xs text-blue-700 dark:text-blue-400 space-y-1 list-decimal list-inside">
                            <li>NEIS 인사기록카드 또는 기안문에서 교사 정보를 복사합니다.</li>
                            <li>아래 입력란에 붙여넣기 (Ctrl+V) 합니다.</li>
                            <li>"데이터 분석" 버튼을 클릭하여 자동 추출합니다.</li>
                        </ol>
                    </div>

                    {/* Input Area */}
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                NEIS 데이터 붙여넣기
                            </label>
                            <button
                                onClick={handleCopyTemplate}
                                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                            >
                                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                {copied ? '복사됨!' : '샘플 형식 복사'}
                            </button>
                        </div>
                        <textarea
                            value={rawData}
                            onChange={(e) => setRawData(e.target.value)}
                            placeholder={`예시:
학교코드: B123456
학교명: OO초등학교
성명: 홍길동
호봉: 7호봉
계약기간: 2025-03-01 ~ 2025-08-31
담당교과: 국어, 수학`}
                            className="w-full h-40 p-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Parse Button */}
                    {!extractedData && (
                        <button
                            onClick={parseNEISData}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            <Search className="w-4 h-4" /> 데이터 분석
                        </button>
                    )}

                    {/* Extracted Data Preview */}
                    {extractedData && (
                        <div className="border border-emerald-200 dark:border-emerald-800 rounded-xl overflow-hidden">
                            <div className="bg-emerald-50 dark:bg-emerald-900/30 px-4 py-2 border-b border-emerald-200 dark:border-emerald-800">
                                <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                                    ✅ 추출된 데이터
                                </span>
                            </div>
                            <div className="p-4 space-y-3 bg-white dark:bg-slate-900">
                                {[
                                    { label: '학교코드', value: extractedData.schoolCode },
                                    { label: '학교명', value: extractedData.schoolName },
                                    { label: '교사명', value: extractedData.teacherName },
                                    { label: '호봉', value: extractedData.salaryStep ? `${extractedData.salaryStep}호봉` : '미확인' },
                                    { label: '계약 시작일', value: extractedData.startDate || '미확인' },
                                    { label: '계약 종료일', value: extractedData.endDate || '미확인' },
                                    { label: '담당 과목', value: extractedData.subjects.join(', ') },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex justify-between text-sm">
                                        <span className="text-slate-500">{label}</span>
                                        <span className="font-medium text-slate-800 dark:text-white">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                    >
                        취소
                    </button>
                    {extractedData && (
                        <button
                            onClick={handleApply}
                            className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            데이터 적용하기
                        </button>
                    )}
                </div>
            </StandardCard>
        </div>
    );
}
