"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function RecommendedJobs() {
    const { token } = useAuth();
    const [jobs, setJobs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchRecommendedJobs();
        }
    }, [token]);

    const fetchRecommendedJobs = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/matching/recommended-jobs`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setJobs(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return null; // Or skeleton
    if (jobs.length === 0) return null; // Don't show if no recommendations

    return (
        <div className="mb-12">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span>✨</span> 회원님에게 딱 맞는 채용 공고
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                {jobs.map((job) => (
                    <div key={job.id} className="min-w-[300px] bg-gradient-to-br from-primary/5 to-white p-6 rounded-2xl border border-primary/10 shadow-sm hover:shadow-md transition-all snap-start">
                        <div className="flex justify-between items-start mb-3">
                            <span className="px-2 py-1 bg-white/80 text-primary text-xs font-bold rounded-lg border border-primary/10">
                                매칭 점수 {job.matchScore}점
                            </span>
                            <span className="text-xs text-slate-400">{new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1 line-clamp-1">{job.title}</h3>
                        <p className="text-sm text-slate-600 mb-3">{job.schoolProfile?.schoolName}</p>
                        <div className="flex gap-1 mb-4">
                            {job.subjects.slice(0, 2).map((s: string) => (
                                <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md">{s}</span>
                            ))}
                            {job.regions.slice(0, 1).map((r: string) => (
                                <span key={r} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md">{r}</span>
                            ))}
                        </div>
                        <Link
                            href={`/dashboard/jobs/${job.id}`}
                            className="block w-full py-2 bg-white text-primary text-center text-sm font-bold rounded-xl border border-primary/20 hover:bg-primary hover:text-white transition-all"
                        >
                            상세 보기
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
