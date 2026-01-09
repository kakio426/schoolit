"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import { JobListing, JobApplication } from '@/types';
import { Role } from '@/lib/constants';
import QuickApplyModal from '@/components/applications/QuickApplyModal';
import StandardCard, { StandardBadge } from '@/components/ui/StandardCard';
import { Calendar, MapPin, Clock, BookOpen, User, Building, ExternalLink, ChevronLeft, Send, CheckCircle, FileText } from 'lucide-react';

export default function JobDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [job, setJob] = useState<JobListing | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isApplying, setIsApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

    const profileCompleteness = user?.role === 'TEACHER' ? 85 : 100;
    const isProfileIncomplete = profileCompleteness < 80;

    const handleApplyClick = () => {
        if (isProfileIncomplete) {
            alert(`프로필이 ${profileCompleteness}% 완성되었습니다. 80% 이상 작성해야 지원 가능합니다.`);
            return;
        }
        setIsApplyModalOpen(true);
    };

    useEffect(() => {
        if (id) {
            fetchJob();
            checkExistingApplication();
        }
    }, [id]);

    const fetchJob = async () => {
        try {
            const data = await api.get<JobListing>(`/jobs/${id}`);
            setJob(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const checkExistingApplication = async () => {
        try {
            const data = await api.get<JobApplication[]>('/applications/me');
            const existing = data.find((a) => a.jobId === Number(id));
            if (existing) setHasApplied(true);
        } catch (e) {
            console.error(e);
        }
    };

    const handleApplySubmit = async (data: any) => {
        setIsApplying(true);
        try {
            await api.post(`/applications/${id}/apply`, data);
            alert('지원이 완료되었습니다!');
            setHasApplied(true);
            router.push('/dashboard/applications');
        } catch (e: any) {
            alert(e.message || '지원 중 오류가 발생했습니다.');
        } finally {
            setIsApplying(false);
        }
    };

    if (isLoading) return <DashboardLayout><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div></DashboardLayout>;
    if (!job) return <DashboardLayout><div className="text-center py-20">공고를 찾을 수 없습니다.</div></DashboardLayout>;

    const isTeacherHiring = (job as any).jobType === 'TEACHER_HIRING';
    const isEventVendor = (job as any).jobType === 'EVENT_VENDOR';

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto pb-24">
                {/* Header Navigation */}
                <div className="flex items-center justify-between mb-8 animate-in fade-in slide-in-from-left-4 duration-300">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors font-medium"
                    >
                        <ChevronLeft className="w-5 h-5" /> 뒤로 가기
                    </button>
                    <div className="flex gap-2">
                        {job.active ? (
                            <StandardBadge variant="primary" className="animate-pulse">모집 중</StandardBadge>
                        ) : (
                            <StandardBadge variant="error">모집 완료</StandardBadge>
                        )}
                        <StandardBadge variant="indigo">{(job as any).jobType === 'EVENT_VENDOR' ? '🏢 행사/입찰' : '🎓 교사 채용'}</StandardBadge>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Main Content */}
                    <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Title Section */}
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {job.subjects?.map(s => <StandardBadge key={s} variant="primary">{s}</StandardBadge>)}
                                {job.regions?.map(r => <StandardBadge key={r} variant="indigo">{r}</StandardBadge>)}
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-foreground leading-[1.2]">{job.title}</h1>
                            <div className="flex items-center gap-4 text-foreground-muted text-sm">
                                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(job.createdAt).toLocaleDateString()} 등록</span>
                                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> 조회수 124</span>
                            </div>
                        </div>

                        {/* Description Card */}
                        <StandardCard title="공고 상세 내용" icon={<FileText className="w-5 h-5 text-primary" />}>
                            <div className="text-foreground leading-relaxed whitespace-pre-wrap text-[17px]">
                                {job.description}
                            </div>
                        </StandardCard>

                        {/* Detailed Requirements Card */}
                        <StandardCard title="상세 요건" icon={<BookOpen className="w-5 h-5 text-indigo-500" />}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                                {isTeacherHiring && (
                                    <>
                                        <div className="space-y-1">
                                            <div className="text-xs font-bold text-foreground-muted uppercase tracking-wider">계약 기간</div>
                                            <div className="text-lg font-black text-foreground">{(job as any).contractPeriod || '협의'}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-xs font-bold text-foreground-muted uppercase tracking-wider">주당 수업 시수</div>
                                            <div className="text-lg font-black text-foreground">{(job as any).teachingHours ? `${(job as any).teachingHours}시간` : '협의'}</div>
                                        </div>
                                        <div className="md:col-span-2 space-y-1">
                                            <div className="text-xs font-bold text-foreground-muted uppercase tracking-wider">담당 학년</div>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {(job as any).gradeLevel?.map((lvl: string) => (
                                                    <span key={lvl} className="px-3 py-1 bg-background border border-border rounded-lg text-sm font-bold text-foreground">{lvl}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                                {isEventVendor && (
                                    <>
                                        <div className="space-y-1">
                                            <div className="text-xs font-bold text-foreground-muted uppercase tracking-wider">행사 종류</div>
                                            <div className="text-lg font-black text-foreground">{(job as any).eventType || '전체'}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-xs font-bold text-foreground-muted uppercase tracking-wider">참가 예상 인원</div>
                                            <div className="text-lg font-black text-foreground">{(job as any).participantCount || '미정'}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-xs font-bold text-foreground-muted uppercase tracking-wider">장비/교구 제공</div>
                                            <div className="text-lg font-black text-foreground">{(job as any).equipmentProvided ? '업체 지참 권장' : '학교 측 제공'}</div>
                                        </div>
                                        <div className="md:col-span-2 space-y-1">
                                            <div className="text-xs font-bold text-foreground-muted uppercase tracking-wider">필수 자격 요건</div>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {(job as any).certifications?.map((cert: string) => (
                                                    <span key={cert} className="px-3 py-1 bg-purple-500/10 text-purple-500 border border-purple-500/20 rounded-lg text-sm font-bold">{cert}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </StandardCard>

                        {/* Poster Info Card */}
                        <StandardCard
                            title={job.schoolProfile ? '학교 정보' : '요청자 정보'}
                            icon={job.schoolProfile ? <Building className="w-5 h-5 text-emerald-500" /> : <User className="w-5 h-5 text-orange-500" />}
                            extra={job.schoolProfile?.website && (
                                <a href={job.schoolProfile.website} target="_blank" rel="noreferrer" className="text-primary flex items-center gap-1 text-sm font-bold hover:underline">
                                    홈페이지 <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                        >
                            <div className="flex items-center gap-5 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-border/50">
                                <div className="w-14 h-14 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center text-3xl shadow-sm border border-border">
                                    {job.schoolProfile ? '🏫' : '👤'}
                                </div>
                                <div>
                                    <h4 className="font-black text-xl text-foreground">{job.schoolProfile?.schoolName || (job as any).teacherProfile?.user?.name || '정보 없음'}</h4>
                                    <p className="text-sm text-foreground-muted flex items-center gap-1.5 mt-1">
                                        <MapPin className="w-3 h-3" /> {job.schoolProfile?.address || '위치 정보 협의'}
                                    </p>
                                </div>
                            </div>
                        </StandardCard>
                    </div>

                    {/* Right Column: Sticky Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="sticky top-24 space-y-6">
                            <StandardCard className="border-t-4 border-t-primary">
                                <div className="space-y-6">
                                    <div>
                                        <div className="text-xs font-bold text-foreground-muted uppercase mb-1">상태</div>
                                        {/* Compliance Workflow Status */}
                                        {(job as any).workflowStatus && (job as any).workflowStatus !== 'PUBLISHED' ? (
                                            <div className="space-y-2">
                                                <div className="text-xl font-black text-amber-500 flex items-center gap-2">
                                                    {(job as any).workflowStatus === 'PLAN_DRAFT' ? '기안 작성 중' : '내부 결재 진행 중'}
                                                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
                                                </div>
                                                <p className="text-xs text-foreground-muted">
                                                    현재 이 공고는 외부에 노출되지 않습니다.<br />
                                                    학교장 결재 완료 후 자동 게시됩니다.
                                                </p>
                                                {user?.id === job.schoolId && (job as any).workflowStatus === 'PLAN_DRAFT' && (
                                                    <button onClick={() => alert('결재 상신 기능은 준비 중입니다.')} className="w-full py-2 bg-amber-100 text-amber-700 font-bold rounded-xl text-sm hover:bg-amber-200 transition-colors">
                                                        결재 올리기 (상신)
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-2xl font-black text-foreground flex items-center gap-2">
                                                {job.active ? '지원 가능' : '마감된 공고'}
                                                {job.active && <span className="w-2.5 h-2.5 bg-success rounded-full animate-bounce" />}
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-6 border-t border-border">
                                        {hasApplied ? (
                                            <div className="space-y-4">
                                                <div className="flex flex-col items-center justify-center p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-center">
                                                    <CheckCircle className="w-10 h-10 text-emerald-500 mb-3" />
                                                    <div className="font-black text-emerald-600 dark:text-emerald-400">지원 완료</div>
                                                    <p className="text-xs text-foreground-muted mt-1">담당자가 확인 중입니다.</p>
                                                </div>
                                                <Link
                                                    href="/dashboard/applications"
                                                    className="w-full py-4 bg-emerald-500 text-white font-black rounded-2xl text-center block shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
                                                >
                                                    지원 현황 확인하기
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {/* Role Permission Check */}
                                                {((isEventVendor && user?.role !== 'BUSINESS') || (isTeacherHiring && user?.role !== 'TEACHER')) ? (
                                                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400 text-xs leading-relaxed text-center font-bold">
                                                        ⚠️ 이 공고의 자격 요건(역할)과<br />사용자 계정 정보가 일치하지 않습니다.
                                                    </div>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={handleApplyClick}
                                                            disabled={isApplying || !job.active}
                                                            className="w-full py-5 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 text-lg flex items-center justify-center gap-2"
                                                        >
                                                            <Send className="w-5 h-5" /> 간편 지원하기
                                                        </button>
                                                        <p className="text-center text-[11px] text-foreground-muted font-medium">
                                                            * 프로필 정보가 자동으로 전송됩니다.<br />
                                                            * 승인 후에는 담당자와 채팅이 가능합니다.
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </StandardCard>

                            {/* Info Card Snippet */}
                            <div className="bg-indigo-600 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden">
                                <div className="relative z-10">
                                    <h5 className="font-bold text-indigo-100 text-xs mb-4">공고 요약</h5>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center border-b border-indigo-500/50 pb-3">
                                            <span className="text-sm opacity-80">과목/분야</span>
                                            <span className="font-bold">{job.subjects?.[0] || '전체'}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-indigo-500/50 pb-3">
                                            <span className="text-sm opacity-80">지역</span>
                                            <span className="font-bold">{job.regions?.[0] || '전체'}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm opacity-80">모집 인원</span>
                                            <span className="font-bold">1명</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Subtle Background Pattern */}
                                <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sticky Button Only (Floating style) */}
            {!hasApplied && job.active && user && ((isEventVendor && user.role === 'BUSINESS') || (isTeacherHiring && user.role === 'TEACHER')) && (
                <div className="fixed bottom-6 left-6 right-6 z-50 md:hidden animate-in slide-in-from-bottom-full duration-500">
                    <button
                        onClick={handleApplyClick}
                        className="w-full py-5 bg-primary text-white font-black rounded-2xl shadow-2xl shadow-primary/40 active:scale-95 transition-transform flex items-center justify-center gap-2"
                    >
                        <Send className="w-5 h-5" /> 1초 만에 지원하기
                    </button>
                </div>
            )}

            <QuickApplyModal
                isOpen={isApplyModalOpen}
                onClose={() => setIsApplyModalOpen(false)}
                onSubmit={handleApplySubmit}
                jobType={(job as any).jobType || 'TEACHER_HIRING'}
                jobTitle={job.title}
            />
        </DashboardLayout>
    );
}
