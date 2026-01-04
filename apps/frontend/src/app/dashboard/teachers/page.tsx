"use client";

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import JobSearchFilter from '@/components/jobs/JobSearchFilter';
import { api } from '@/lib/api';
import { TeacherProfile, JobListing } from '@/types';

export default function TeacherSearchPage() {
    const { user } = useAuth();
    const [teachers, setTeachers] = useState<any[]>([]); // Teacher info often comes with nested user
    const [isLoading, setIsLoading] = useState(false);
    const [myJobs, setMyJobs] = useState<JobListing[]>([]);
    const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
    const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);

    // Initial load
    useEffect(() => {
        if (user?.role === 'SCHOOL') {
            fetchTeachers({});
        }
    }, [user]);

    const fetchTeachers = async (filters: any) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.subject) params.append('subject', filters.subject);
            if (filters.region) params.append('region', filters.region);
            if (filters.keyword) params.append('keyword', filters.keyword);

            const data = await api.get<any[]>(`/matching/teachers?${params}`);
            setTeachers(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMyJobs = async () => {
        try {
            const allJobs = await api.get<JobListing[]>(`/jobs`);
            const mine = allJobs.filter((j) => j.schoolProfile?.userId === user?.id && j.active);
            setMyJobs(mine);
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
            await api.post(`/applications/${jobId}/suggest`, { teacherUserId: selectedTeacherId });
            alert('제안을 보냈습니다!');
            setIsSuggestModalOpen(false);
        } catch (e: any) {
            alert(e.message || '오류가 발생했습니다.');
        }
    };

    if (user?.role !== 'SCHOOL') {
        return <DashboardLayout><div>접근 권한이 없습니다.</div></DashboardLayout>;
    }

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-foreground">🔎 인재 찾기</h1>
                    <p className="text-foreground-muted text-sm">우리 학교에 딱 맞는 선생님을 찾아보세요.</p>
                </div>

                <JobSearchFilter onSearch={fetchTeachers} />

                {isLoading ? (
                    <div className="text-center py-20 text-foreground-muted">검색 중...</div>
                ) : teachers.length === 0 ? (
                    <div className="text-center py-20 text-foreground-muted">조건에 맞는 선생님이 없습니다.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {teachers.map((t) => (
                            <div key={t.id} className="bg-surface p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex flex-col hover:bg-surface-hover">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl overflow-hidden ring-2 ring-slate-100 dark:ring-slate-700">
                                        {t.profileImage ? <img src={t.profileImage} className="w-full h-full object-cover" /> : '👤'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-foreground">{t.user?.name} 선생님</h3>
                                        <div className="flex gap-1 mt-1">
                                            {t.subjects?.slice(0, 2).map((s: string) => <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-xs rounded-md">{s}</span>)}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-foreground-muted text-sm mb-4 line-clamp-3 flex-1">{t.bio || '자기소개가 없습니다.'}</p>
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
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={() => setIsSuggestModalOpen(false)}>
                    <div className="bg-surface w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-700" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-2 text-foreground">제안할 공고 선택</h3>
                        <p className="text-foreground-muted mb-6 text-sm">선생님에게 제안을 보낼 채용 공고를 선택해주세요.</p>

                        <div className="space-y-3 max-h-[300px] overflow-y-auto mb-6 pr-2">
                            {myJobs.length === 0 ? (
                                <div className="text-center text-red-500 py-8 bg-red-50 dark:bg-red-900/20 rounded-2xl">모집 중인 공고가 없습니다.</div>
                            ) : (
                                myJobs.map(job => (
                                    <button
                                        key={job.id}
                                        onClick={() => sendSuggestion(job.id)}
                                        className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 transition-all group bg-surface hover:shadow-sm"
                                    >
                                        <div className="font-bold text-foreground group-hover:text-primary transition-colors">{job.title}</div>
                                        <div className="text-xs text-foreground-muted mt-1">{job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '-'}</div>
                                    </button>
                                ))
                            )}
                        </div>

                        <button
                            onClick={() => setIsSuggestModalOpen(false)}
                            className="w-full py-3 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                        >
                            취소
                        </button>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
