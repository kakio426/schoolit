"use client";

import React, { useState } from 'react';

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
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Subject Filter */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">과목</label>
                    <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-600 bg-slate-50"
                    >
                        <option value="">모든 과목</option>
                        {SUBJECTS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                {/* Region Filter */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">지역</label>
                    <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-600 bg-slate-50"
                    >
                        <option value="">모든 지역</option>
                        {REGIONS.map((r) => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                </div>

                {/* Keyword Search */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">키워드</label>
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="제목, 내용 검색"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-600 bg-slate-50"
                    />
                </div>

                {/* Buttons */}
                <div className="flex items-end gap-2">
                    <button
                        onClick={handleSearch}
                        className="flex-1 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all active:scale-95"
                    >
                        검색
                    </button>
                    <button
                        onClick={handleReset}
                        className="px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
                    >
                        초기화
                    </button>
                </div>
            </div>
        </div>
    );
}
