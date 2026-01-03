"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function JobDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { token, user } = useAuth();
    const [job, setJob] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [isApplying, setIsApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    useEffect(() => {
        if (token && id) {
            fetchJob();
            checkExistingApplication();
        }
    }, [token, id]);

    const fetchJob = async () => {
        try {
            const res = await fetch(`${API_URL}/api/jobs/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setJob(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const checkExistingApplication = async () => {
        try {
            const res = await fetch(`${API_URL}/api/applications/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                const existing = data.find((a: any) => a.jobId === Number(id));
                if (existing) setHasApplied(true);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleApply = async () => {
        if (!message.trim()) {
            alert('지원 메시지를 입력해주세요.');
            return;
        }
        setIsApplying(true);
        try {
            const res = await fetch(`${API_URL}/api/applications/${id}/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ message })
            });

            if (res.ok) {
                alert('지원이 완료되었습니다!');
                setHasApplied(true);
                router.push('/dashboard/applications');
            } else {
                const err = await res.json();
                alert(err.message || '지원 중 오류가 발생했습니다.');
            }
        } catch (e) {
            alert('오류가 발생했습니다.');
        } finally {
            setIsApplying(false);
        }
    };

    if (isLoading) return <DashboardLayout><div className="text-center py-20">로딩 중...</div></DashboardLayout>;
    if (!job) return <DashboardLayout><div className="text-center py-20">공고를 찾을 수 없습니다.</div></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="mb-6 text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-2"
                >
                    ← 뒤로 가기
                </button>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                    <div className="p-8 md:p-12 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
                        <div className="flex flex-wrap gap-2 mb-4">
                            {job.subjects.map((s: string) => (
                                <span key={s} className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                                    {s}
                                </span>
                            ))}
                            {job.regions.map((r: string) => (
                                <span key={r} className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                                    {r}
                                </span>
                            ))}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{job.title}</h1>
                        <div className="flex items-center gap-4 text-slate-500">
                            <div className="flex items-center gap-1">
                                <span className="text-lg">🏫</span>
                                <span className="font-medium">{job.schoolProfile?.schoolName}</span>
                            </div>
                            <span>•</span>
                            <div>{new Date(job.createdAt).toLocaleDateString()} 등록</div>
                        </div>
                    </div>

                    <div className="p-8 md:p-12">
                        <div className="mb-12">
                            <h2 className="text-xl font-bold text-slate-800 mb-4">📝 공고 상세 내용</h2>
                            <div className="text-slate-600 leading-relaxed whitespace-pre-wrap text-lg">
                                {job.description}
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
                            <h2 className="text-xl font-bold text-slate-800 mb-6">📍 학교 정보</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                <div>
                                    <div className="text-slate-400 mb-1">학교 위치</div>
                                    <div className="text-slate-700 font-medium">{job.schoolProfile?.address || '정보 없음'}</div>
                                </div>
                                <div>
                                    <div className="text-slate-400 mb-1">담당 부서/이름</div>
                                    <div className="text-slate-700 font-medium">{job.schoolProfile?.schoolName} 채용담당자</div>
                                </div>
                            </div>
                        </div>

                        {user?.role === 'TEACHER' && (
                            <div className="mt-12 border-t border-slate-100 pt-12">
                                {hasApplied ? (
                                    <div className="bg-green-50 border border-green-100 text-green-700 p-6 rounded-2xl text-center">
                                        <div className="text-2xl mb-2">✅</div>
                                        <div className="font-bold">이미 지원한 공고입니다.</div>
                                        <div className="text-sm mt-1">지원 현황에서 진행 상태를 확인하세요.</div>
                                    </div>
                                ) : (
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800 mb-4">🚀 이 공고에 지원하기</h2>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="학교 담당자에게 보낼 자기소개나 메시지를 간단히 입력해주세요."
                                            className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all mb-4"
                                        />
                                        <button
                                            onClick={handleApply}
                                            disabled={isApplying}
                                            className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50"
                                        >
                                            {isApplying ? '지원 중...' : '지원서 제출하기'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
