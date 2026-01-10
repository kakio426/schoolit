import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, BookOpen, MapPin } from 'lucide-react';
import { SUBJECT_GROUPS, KOREA_REGIONS, MAJOR_CITIES } from '@/lib/data';

interface JobSearchFilterProps {
    onSearch: (filters: { subject?: string; region?: string; keyword?: string }) => void;
}

export default function JobSearchFilter({ onSearch }: JobSearchFilterProps) {
    const [subject, setSubject] = useState('');
    const [selectedSido, setSelectedSido] = useState('');
    const [selectedSigungu, setSelectedSigungu] = useState('');
    const [keyword, setKeyword] = useState('');

    const handleSearch = () => {
        const regionString = selectedSigungu ? `${selectedSido} ${selectedSigungu}` : selectedSido;
        onSearch({
            subject: subject || undefined,
            region: regionString || undefined,
            keyword: keyword || undefined,
        });
    };

    const handleReset = () => {
        setSubject('');
        setSelectedSido('');
        setSelectedSigungu('');
        setKeyword('');
        onSearch({});
    };

    return (
        <div className="flex flex-col xl:flex-row items-stretch gap-3 w-full p-4 bg-gray-950/80 border border-white/[0.05] rounded-[24px] shadow-2xl backdrop-blur-md">
            {/* Subject Filter */}
            <div className="flex-1 relative group">
                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full pl-11 pr-10 py-3 rounded-xl bg-zinc-900 border border-white/[0.08] focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-zinc-100 text-[13px] font-bold appearance-none cursor-pointer"
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
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                </div>
            </div>

            {/* Region Filter */}
            <div className="flex-[1.5] flex gap-2">
                <div className="flex-1 relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                    <select
                        value={selectedSido}
                        onChange={(e) => { setSelectedSido(e.target.value); setSelectedSigungu(''); }}
                        className="w-full pl-11 pr-10 py-3 rounded-xl bg-zinc-900 border border-white/[0.08] focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-zinc-100 text-[13px] font-bold appearance-none cursor-pointer"
                    >
                        <option value="">모든 지역</option>
                        {MAJOR_CITIES.map((city) => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                    </div>
                </div>
                <div className="flex-1 relative group">
                    <select
                        value={selectedSigungu}
                        onChange={(e) => setSelectedSigungu(e.target.value)}
                        disabled={!selectedSido}
                        className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/[0.08] focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-zinc-100 text-[13px] font-bold appearance-none cursor-pointer disabled:opacity-30"
                    >
                        <option value="">시/군/구</option>
                        {selectedSido && KOREA_REGIONS[selectedSido]?.map((gu) => (
                            <option key={gu} value={gu}>{gu}</option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                    </div>
                </div>
            </div>

            {/* Keyword Search */}
            <div className="flex-[1.5] relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="제목, 학교명 검색..."
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-zinc-900 border border-white/[0.08] focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-zinc-100 text-[13px] font-bold placeholder:text-zinc-600 outline-none"
                />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
                <button
                    onClick={handleSearch}
                    className="flex-1 xl:flex-none px-6 py-3 bg-blue-600 text-white text-[13px] font-black rounded-xl hover:bg-blue-500 shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    <Search className="w-4 h-4" />
                    검색하기
                </button>
                <button
                    onClick={handleReset}
                    className="p-3 text-zinc-500 hover:text-white bg-zinc-900 border border-white/[0.05] rounded-xl hover:border-white/10 transition-all active:rotate-[-45deg]"
                    title="초기화"
                >
                    <RotateCcw className="w-4.5 h-4.5" />
                </button>
            </div>
        </div>
    );
}

