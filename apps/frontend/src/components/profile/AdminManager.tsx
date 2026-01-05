import React from 'react';
import { CheckSquare, Square, Copy, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ChecklistItem {
    id: string;
    label: string;
    description: string;
    checked: boolean;
}

interface AdminManagerProps {
    type: 'TEACHER' | 'BUSINESS';
    items: ChecklistItem[];
    onCheck: (id: string, checked: boolean) => void;
    quickData?: {
        label: string;
        value: string;
    }[];
}

export default function AdminManager({ type, items, onCheck, quickData }: AdminManagerProps) {
    const total = items.length;
    const checkedCount = items.filter(i => i.checked).length;
    const progress = total > 0 ? Math.round((checkedCount / total) * 100) : 0;

    const copyToClipboard = (text: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        // In a real app, use a toast notification here
        alert('복사되었습니다: ' + text);
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 md:p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 text-xs font-black rounded-lg ${type === 'TEACHER'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                            }`}>
                            {type === 'TEACHER' ? 'TEACHER ADMIN' : 'BUSINESS ADMIN'}
                        </span>
                        <span className="text-sm font-bold text-slate-400">행정 서류 매니저</span>
                    </div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        {type === 'TEACHER' ? '강사 필수 서류' : '업체 필수 증빙'}
                    </h2>
                    <p className="mt-1 text-slate-500 text-sm font-medium">
                        {type === 'TEACHER'
                            ? '서류를 별도로 준비하여 학교 행정실에 직접 제출해주세요.'
                            : '계약 시 필요한 사업자 증빙 서류 준비 상태를 관리하세요.'}
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 min-w-[120px]">
                    <div className="text-right">
                        <p className="text-xs font-bold opacity-40 mb-1">서류 준비도</p>
                        <p className={`text-3xl font-black ${progress === 100 ? 'text-green-500' : 'text-blue-500'}`}>
                            {progress}%
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Checklist (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                    <h3 className="text-xs font-black opacity-30 uppercase tracking-widest mb-2 flex items-center justify-between">
                        Checklist
                        <span className="text-[10px] font-normal normal-case opacity-100 bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                            파일 업로드 없음 (보안 정책)
                        </span>
                    </h3>
                    <div className="space-y-3">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => onCheck(item.id, !item.checked)}
                                className={`p-4 rounded-2xl border flex items-center justify-between transition-all cursor-pointer group ${item.checked
                                    ? 'bg-white dark:bg-slate-800 border-green-200 dark:border-green-900/30 shadow-sm'
                                    : 'bg-white dark:bg-slate-800/80 border-slate-100 dark:border-slate-700/50 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${item.checked
                                        ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                                        : 'bg-slate-50 text-slate-300 dark:bg-slate-900 dark:text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-500'
                                        }`}>
                                        {item.checked ? <CheckCircle2 className="w-6 h-6" /> : <Square className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h4 className={`font-bold text-sm ${item.checked ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500'}`}>
                                            {item.label}
                                        </h4>
                                        <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                                    </div>
                                </div>
                                {item.checked && (
                                    <span className="text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg whitespace-nowrap">
                                        준비됨
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Quick Data (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                    <h3 className="text-xs font-black opacity-30 uppercase tracking-widest mb-2">Quick Integration</h3>

                    <div className="bg-white dark:bg-slate-800 rounded-[24px] p-6 shadow-sm border border-slate-200 dark:border-slate-700 h-fit">
                        {quickData && quickData.length > 0 ? (
                            <div className="space-y-4">
                                {quickData.map((data, idx) => (
                                    <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] font-bold opacity-40 mb-2 uppercase tracking-wider">{data.label}</p>
                                        <div className="flex justify-between items-center">
                                            <span className={`font-mono font-bold text-sm truncate mr-2 ${!data.value ? 'text-slate-300 italic' : 'text-slate-700 dark:text-slate-200'}`}>
                                                {data.value || '(정보 없음)'}
                                            </span>
                                            {data.value && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); copyToClipboard(data.value); }}
                                                    className="flex-shrink-0 text-[10px] font-black text-blue-600 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
                                                >
                                                    <Copy className="w-3 h-3" /> 복사
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 opacity-50">
                                <p className="text-xs">등록된 빠른 정보가 없습니다.</p>
                            </div>
                        )}

                        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                            <button type="button" className="w-full py-4 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-bold text-sm shadow-lg hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2 group">
                                <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                행정실 제출용 목록 생성
                            </button>
                            <p className="text-[10px] text-center text-slate-400 mt-3 leading-relaxed">
                                *준비된 항목을 바탕으로 인쇄 가능한 PDF를 생성합니다.<br />
                                (실제 증빙 서류는 별도로 챙기셔야 합니다)
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
