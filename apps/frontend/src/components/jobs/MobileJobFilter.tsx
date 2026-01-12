import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Search } from 'lucide-react';
import { SUBJECT_GROUPS, KOREA_REGIONS, MAJOR_CITIES } from '@/lib/data';

interface MobileJobFilterProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: (filters: { subject?: string; region?: string; keyword?: string }) => void;
    initialFilters?: { subject?: string; region?: string; keyword?: string };
}

export default function MobileJobFilter({ isOpen, onClose, onSearch, initialFilters }: MobileJobFilterProps) {
    const [subject, setSubject] = useState(initialFilters?.subject || '');
    const [selectedSido, setSelectedSido] = useState(initialFilters?.region?.split(' ')[0] || '');
    const [selectedSigungu, setSelectedSigungu] = useState(initialFilters?.region?.split(' ')[1] || '');
    const [keyword, setKeyword] = useState(initialFilters?.keyword || '');

    const handleSearch = () => {
        const regionString = selectedSigungu ? `${selectedSido} ${selectedSigungu}` : selectedSido;
        onSearch({
            subject: subject || undefined,
            region: regionString || undefined,
            keyword: keyword || undefined,
        });
        onClose();
    };

    const handleReset = () => {
        setSubject('');
        setSelectedSido('');
        setSelectedSigungu('');
        setKeyword('');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm lg:hidden"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 rounded-t-3xl z-50 lg:hidden flex flex-col max-h-[90vh] shadow-2xl safe-area-bottom"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/[0.05]">
                            <h3 className="text-lg font-bold">검색 필터</h3>
                            <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content Scrollable */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-6">
                            {/* Keyword Input */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">검색어</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={keyword}
                                        onChange={(e) => setKeyword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-white/[0.05] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-bold"
                                        placeholder="학교명, 제목 검색"
                                    />
                                </div>
                            </div>

                            {/* Subject Select */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">과목</label>
                                <select
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-white/[0.05] text-sm font-bold outline-none"
                                >
                                    <option value="">전체 과목</option>
                                    {SUBJECT_GROUPS.map((group) => (
                                        <optgroup key={group.name} label={group.name}>
                                            {group.subjects.map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>

                            {/* Region Selects */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">지역</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <select
                                        value={selectedSido}
                                        onChange={(e) => { setSelectedSido(e.target.value); setSelectedSigungu(''); }}
                                        className="w-full px-3 py-3 bg-slate-50 dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-white/[0.05] text-sm font-bold outline-none"
                                    >
                                        <option value="">시/도 선택</option>
                                        {MAJOR_CITIES.map((city) => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={selectedSigungu}
                                        onChange={(e) => setSelectedSigungu(e.target.value)}
                                        disabled={!selectedSido}
                                        className="w-full px-3 py-3 bg-slate-50 dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-white/[0.05] text-sm font-bold outline-none disabled:opacity-50"
                                    >
                                        <option value="">시/군/구</option>
                                        {selectedSido && KOREA_REGIONS[selectedSido]?.map((gu) => (
                                            <option key={gu} value={gu}>{gu}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 border-t border-slate-100 dark:border-white/[0.05] flex gap-3 pb-8 lg:pb-4">
                            <button
                                onClick={handleReset}
                                className="p-3 text-slate-500 hover:text-slate-700 bg-slate-100 dark:bg-zinc-800 rounded-xl transition-colors"
                            >
                                <RotateCcw className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleSearch}
                                className="flex-1 bg-primary text-white font-bold rounded-xl py-3 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                            >
                                검색 결과 보기
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
