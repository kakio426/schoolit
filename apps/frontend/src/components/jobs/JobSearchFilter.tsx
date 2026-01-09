"use client";

import React, { useState } from 'react';
import { Search, RotateCcw, BookOpen, MapPin } from 'lucide-react';

interface JobSearchFilterProps {
    onSearch: (filters: { subject?: string; region?: string; keyword?: string }) => void;
}

const SUBJECTS = ['수학', '영어', '과학', '국어', '사회', '체육', '음악', '미술', '정보'];
const REGIONS = ['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];

export default function JobSearchFilter({ onSearch }: JobSearchFilterProps) {
    const [subject, setSubject] = useState('');
    const [region, setRegion] = useState('');
    const [keyword, setKeyword] = useState('');

    const handleSearch = () => {
        onSearch({
            subject: subject || undefined,
            region: region || undefined,
            keyword: keyword || undefined,
        });
    };

    const handleReset = () => {
        setSubject('');
        setRegion('');
        setKeyword('');
        onSearch({});
    };

    return (
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full p-3 bg-slate-800/50 border border-slate-700 rounded-xl">
            {/* Subject Filter */}
            <div className="flex-1 relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-200 text-sm appearance-none cursor-pointer"
                >
                    <option value="">모든 과목</option>
                    {SUBJECTS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            {/* Region Filter */}
            <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-200 text-sm appearance-none cursor-pointer"
                >
                    <option value="">모든 지역</option>
                    {REGIONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                    ))}
                </select>
            </div>

            {/* Keyword Search */}
            <div className="flex-[1.5] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="제목, 학교명 검색..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-200 text-sm placeholder:text-slate-600"
                />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
                <button
                    onClick={handleSearch}
                    className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-all flex items-center gap-2"
                >
                    <Search className="w-4 h-4" />
                    검색
                </button>
                <button
                    onClick={handleReset}
                    className="p-2.5 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg transition-all"
                    title="초기화"
                >
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
