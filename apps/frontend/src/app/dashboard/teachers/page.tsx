"use client";

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import JobSearchFilter from '@/components/jobs/JobSearchFilter';

export default function TeacherSearchPage() {
    const { token, user } = useAuth();
    const [teachers, setTeachers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [myJobs, setMyJobs] = useState<any[]>([]);
    const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
    const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    // Initial load
    useEffect(() => {
        if (token && user?.role === 'SCHOOL') {
            fetchTeachers({});
        }
    }, [token, user]);

    const fetchTeachers = async (filters: any) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.subject) params.append('subject', filters.subject);
            if (filters.region) params.append('region', filters.region);
            if (filters.keyword) params.append('keyword', filters.keyword);

            const res = await fetch(`${API_URL}/api/matching/teachers?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setTeachers(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMyJobs = async () => {
        try {
            const res = await fetch(`${API_URL}/api/jobs`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const allJobs = await res.json();
                const mine = allJobs.filter((j: any) => j.schoolProfile?.userId === user?.id && j.active);
                setMyJobs(mine);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const openSuggestModal = (tId: number) => {
        setSelectedTeacherId(tId);
        fetchMyJobs();
        setIsSuggestModalOpen(true);
    };

    const sendSuggestion = async (jobId: number) => {
        if (!selectedTeacherId) return;
        try {
            const res = await fetch(`${API_URL}/api/applications/${jobId}/suggest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ teacherUserId: selectedTeacherId })
            });

            if (res.ok) {
                alert('제안을 보냈습니다!');
                setIsSuggestModalOpen(false);
            } else {
                const err = await res.json();
                alert(err.message);
            }
        } catch (e) {
            alert('오류가 발생했습니다.');
        }
    };

    if (user?.role !== 'SCHOOL') {
        return <DashboardLayout><div>접근 권한이 없습니다.</div></DashboardLayout>;
    }

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto">
                <h1 className="text-2xl font-bold text-slate-800 mb-8">🔎 인재 찾기</h1>

                <JobSearchFilter onSearch={fetchTeachers} />

                {isLoading ? (
                    <div className="text-center py-20">검색 중...</div>
                ) : teachers.length === 0 ? (
                    <div className="text-center py-20 text-slate-500">조건에 맞는 선생님이 없습니다.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {teachers.map((t) => (
                            <div key={t.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-2xl overflow-hidden">
                                        {t.profileImage ? <img src={t.profileImage} className="w-full h-full object-cover" /> : '👤'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-800">{t.user?.name} 선생님</h3>
                                        <div className="flex gap-1 mt-1">
                                            {t.subjects.slice(0, 2).map((s: string) => <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-md">{s}</span>)}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-slate-600 text-sm mb-4 line-clamp-3 flex-1">{t.bio || '자기소개가 없습니다.'}</p>
                                <div className="mt-auto">
                                    <button
                                        onClick={() => openSuggestModal(t.user.id)}
                                        className="w-full py-2 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
                                    >
                                        제안 보내기
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Suggestion Modal */}
            {isSuggestModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold mb-4">제안할 공고 선택</h3>
                        <p className="text-slate-500 mb-6 text-sm">선생님에게 제안을 보낼 채용 공고를 선택해주세요.</p>

                        <div className="space-y-3 max-h-[300px] overflow-y-auto mb-6">
                            {myJobs.length === 0 ? (
                                <div className="text-center text-red-500 py-4">모집 중인 공고가 없습니다.</div>
                            ) : (
                                myJobs.map(job => (
                                    <button
                                        key={job.id}
                                        onClick={() => sendSuggestion(job.id)}
                                        className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all group"
                                    >
                                        <div className="font-bold text-slate-800 group-hover:text-primary">{job.title}</div>
                                        <div className="text-xs text-slate-400 mt-1">{new Date(job.createdAt).toLocaleDateString()}</div>
                                    </button>
                                ))
                            )}
                        </div>

                        <button
                            onClick={() => setIsSuggestModalOpen(false)}
                            className="w-full py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
                        >
                            취소
                        </button>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
