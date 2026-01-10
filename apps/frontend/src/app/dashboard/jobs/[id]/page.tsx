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
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

    // 🔥 hasApplied는 백엔드에서 받아옴 (중복 지원 방지)
    const hasApplied = (job as any)?.hasApplied || false;

    const handleApplyClick = () => {
        // 1. 로그인 체크
        if (!user) {
            alert('로그인이 필요합니다.');
            router.push('/auth/login');
            return;
        }

        // 2. 역할 체크
        const isTeacherHiring = job?.jobType === 'TEACHER_HIRING';
        const isEventVendor = job?.jobType === 'EVENT_VENDOR';

        if (isTeacherHiring && user.role !== 'TEACHER') {
            alert('선생님 계정으로만 지원할 수 있습니다.');
            return;
        }

        if (isEventVendor && user.role !== 'BUSINESS') {
            alert('기업 계정으로만 지원할 수 있습니다.');
            return;
        }

        // 3. 🆔 프로필 존재 여부 체크 (핵심!)
        if (isTeacherHiring && !user.teacherProfile) {
            const confirm = window.confirm(
                '지원하려면 먼저 선생님 프로필을 등록해야 합니다.\n프로필 등록 페이지로 이동하시겠습니까?'
            );
            if (confirm) router.push('/dashboard/profile/edit');
            return;
        }

        if (isEventVendor && !user.businessProfile) {
            const confirm = window.confirm(
                '지원하려면 먼저 기업 프로필을 등록해야 합니다.\n프로필 등록 페이지로 이동하시겠습니까?'
            );
            if (confirm) router.push('/dashboard/profile/edit');
            return;
        }

        // 4. 모달 열기
        setIsApplyModalOpen(true);
    };

    useEffect(() => {
        if (id) {
            fetchJob();
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

    const handleApplySubmit = async (data: any) => {
        setIsApplying(true);
        try {
            await api.post(`/applications/${id}/apply`, data);
            alert('✅ 지원이 완료되었습니다!');
            setIsApplyModalOpen(false);
            // 🔄 지원 완료 후 공고 정보 다시 불러오기 (hasApplied 업데이트)
            await fetchJob();
        } catch (e: any) {
            alert(e.message || '지원 중 오류가 발생했습니다.');
        } finally {
            setIsApplying(false);
        }
    };

    if (isLoading) return <DashboardLayout><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div></DashboardLayout>;
    if (!job) return <DashboardLayout><div className="text-center py-20">공고를 찾을 수 없습니다.</div></DashboardLayout>;

    // 🔒 권한 체크: 게시되지 않은 공고는 학교(작성자)와 관리자만 볼 수 있음
    const isSchoolOrAdmin = user?.role === 'SCHOOL' || user?.role === 'ADMIN';
    // workflowStatus가 있으면 PUBLISHED여야 함. 없으면(legacy) 보여줌.
    // 주의: active는 '모집 중' 여부이므로, 모집 종료된 공고(active=false)도 볼 수 있어야 함 -> active 체크 제거
    const isPublished = job.workflowStatus === 'PUBLISHED' || !job.workflowStatus;

    if (!isSchoolOrAdmin && !isPublished) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                    <div className="text-4xl">🔒</div>
                    <div className="text-xl font-bold text-zinc-300">비공개 공고입니다</div>
                    <p className="text-zinc-500">아직 게시되지 않았거나 접근 권한이 없습니다.</p>
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                        돌아가기
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    const isTeacherHiring = job.jobType === 'TEACHER_HIRING';
    const isEventVendor = job.jobType === 'EVENT_VENDOR';

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto pb-20 px-4">
                {/* Header Navigation - More compact */}
                <div className="flex items-center justify-between mb-6 animate-in fade-in slide-in-from-left-4 duration-300">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-sm font-semibold group"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> 뒤로 가기
                    </button>
                    <div className="flex gap-1.5">
                        {job.status === 'OPEN' ? (
                            <StandardBadge variant="success" className="px-2 py-0.5 text-[10px]">모집 중</StandardBadge>
                        ) : (
                            <StandardBadge variant="neutral" className="px-2 py-0.5 text-[10px] text-zinc-400">비공개</StandardBadge>
                        )}
                        <StandardBadge variant="indigo" className="px-2 py-0.5 text-[10px]">{job.jobType === 'EVENT_VENDOR' ? '🏢 행사/입찰' : '🎓 교사 채용'}</StandardBadge>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                    {/* Left Column: Main Content (70%) */}
                    <div className="lg:col-span-7 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Title Section - Tighter and smaller */}
                        <div className="space-y-3">
                            <div className="flex flex-wrap gap-1.5">
                                {job.subjects?.map(s => <span key={s} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded-md border border-blue-500/20">{s}</span>)}
                                {job.regions?.map(r => <span key={r} className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-[10px] font-bold rounded-md border border-white/5">{r}</span>)}
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">{job.title}</h1>
                            <div className="flex items-center gap-3.5 text-zinc-500 text-[12px] font-medium">
                                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(job.createdAt).toLocaleDateString()}</span>
                                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 조회수 124</span>
                            </div>
                        </div>

                        {/* Description Card */}
                        <StandardCard title="공고 상세 내용" icon={<FileText className="w-4 h-4" />}>
                            <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap text-[15px]">
                                {job.description}
                            </div>
                        </StandardCard>

                        {/* Detailed Requirements Card - Horizontal layout for compact info */}
                        <StandardCard title="상세 요건" icon={<BookOpen className="w-4 h-4" />}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {isTeacherHiring && (
                                    <>
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/50 border border-white/[0.03]">
                                            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-tight">계약 기간</span>
                                            <span className="text-[14px] font-black text-zinc-200">{job.contractPeriod || '협의'}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/50 border border-white/[0.03]">
                                            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-tight">주당 수업 시수</span>
                                            <span className="text-[14px] font-black text-zinc-200">{job.teachingHours ? `${job.teachingHours}시간` : '협의'}</span>
                                        </div>
                                        <div className="sm:col-span-2 p-3 rounded-xl bg-zinc-900/50 border border-white/[0.03]">
                                            <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-tight mb-2">담당 학년</div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {job.gradeLevel?.map((lvl: string) => (
                                                    <span key={lvl} className="px-2.5 py-0.5 bg-zinc-800 border border-white/5 rounded-md text-[11px] font-bold text-zinc-300">{lvl}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                                {isEventVendor && (
                                    <>
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/50 border border-white/[0.03]">
                                            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-tight">행사 종류</span>
                                            <span className="text-[14px] font-black text-zinc-200">{job.eventType || '전체'}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/50 border border-white/[0.03]">
                                            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-tight">참가 인원</span>
                                            <span className="text-[14px] font-black text-zinc-200">{job.participantCount || '미정'}</span>
                                        </div>
                                        <div className="sm:col-span-2 p-3 rounded-xl bg-zinc-900/50 border border-white/[0.03]">
                                            <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-tight mb-2">필수 자격 요건</div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {job.certifications?.map((cert: string) => (
                                                    <span key={cert} className="px-2.5 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-md text-[11px] font-bold">{cert}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </StandardCard>

                        {/* Poster Info Card - More compact */}
                        <StandardCard
                            title={job.schoolProfile ? '학교 정보' : '요청자 정보'}
                            icon={job.schoolProfile ? <Building className="w-4 h-4 text-emerald-500" /> : <User className="w-4 h-4 text-orange-500" />}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center text-xl border border-white/[0.05]">
                                    {job.schoolProfile ? '🏫' : '👤'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <h4 className="font-bold text-zinc-100 truncate">{job.schoolProfile?.schoolName || (job as any).teacherProfile?.user?.name || '정보 없음'}</h4>
                                        {job.schoolProfile?.website && (
                                            <a href={job.schoolProfile.website} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-400 transition-colors">
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        )}
                                    </div>
                                    <p className="text-[12px] text-zinc-500 flex items-center gap-1 mt-0.5 truncate">
                                        <MapPin className="w-3 h-3" /> {job.schoolProfile?.address || '위치 정보 협의'}
                                    </p>
                                </div>
                            </div>
                        </StandardCard>
                    </div>

                    {/* Right Column: Sticky Sidebar (30%) */}
                    <div className="lg:col-span-3 space-y-5">
                        <div className="sticky top-24 space-y-5">
                            <StandardCard className="border-t-2 border-t-blue-600 bg-zinc-900/20">
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-[10px] font-black text-zinc-500 uppercase mb-2 tracking-widest">실시간 상태</div>
                                        {job.workflowStatus && job.workflowStatus !== 'PUBLISHED' ? (
                                            <div className="space-y-3">
                                                <div className="text-lg font-black text-amber-500 flex items-center gap-2">
                                                    {job.workflowStatus === 'DRAFT' ? '기안 작성 중' :
                                                        job.workflowStatus === 'PLAN_APPROVED' ? '결재 승인됨' :
                                                            '내부 결재 진행 중'}
                                                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                                                </div>

                                                {user?.role === 'SCHOOL' && (
                                                    <div className="space-y-2">
                                                        {(job.workflowStatus === 'DRAFT' || job.workflowStatus === 'PLAN_DRAFT') && (
                                                            <button
                                                                onClick={async () => {
                                                                    if (!confirm('결재를 승인하시겠습니까?')) return;
                                                                    try {
                                                                        await api.put(`/compliance/jobs/${job.id}/workflow`, { status: 'PLAN_APPROVED' });
                                                                        fetchJob();
                                                                    } catch (e: any) { alert(e.message); }
                                                                }}
                                                                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs transition-colors"
                                                            >
                                                                승인하기
                                                            </button>
                                                        )}
                                                        {job.workflowStatus === 'PLAN_APPROVED' && (
                                                            <button
                                                                onClick={async () => {
                                                                    if (!confirm('공고를 게시하시겠습니까?')) return;
                                                                    try {
                                                                        await api.put(`/compliance/jobs/${job.id}/workflow`, { status: 'PUBLISHED' });
                                                                        alert('공고 게시 완료!');
                                                                        fetchJob();
                                                                    } catch (e: any) { alert(e.message); }
                                                                }}
                                                                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors shadow-lg shadow-emerald-600/20"
                                                            >
                                                                공고 게시하기
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-lg font-black text-white flex items-center gap-2">
                                                {job.active ? '지원 가능' : '모집 완료'}
                                                {job.active && <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />}
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-white/5">
                                        {hasApplied ? (
                                            <div className="space-y-3">
                                                <div className="py-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-center">
                                                    <div className="text-xs font-black text-emerald-500">지원 완료</div>
                                                </div>
                                                <Link
                                                    href="/dashboard/applications"
                                                    className="w-full py-2.5 bg-zinc-800 text-white font-bold rounded-lg text-xs text-center block hover:bg-zinc-700 transition-colors"
                                                >
                                                    내 지원 현황
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {((isEventVendor && user?.role !== 'BUSINESS') || (isTeacherHiring && user?.role !== 'TEACHER')) ? (
                                                    <div className="p-3 bg-zinc-900 border border-white/5 rounded-lg text-[10px] text-zinc-500 text-center font-bold">
                                                        역할이 일치하지 않습니다.
                                                    </div>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={handleApplyClick}
                                                            disabled={isApplying || !job.active}
                                                            className="w-full py-3 bg-blue-600 text-white font-black rounded-lg shadow-lg shadow-blue-600/10 hover:bg-blue-500 active:scale-[0.98] transition-all disabled:opacity-30 text-sm flex items-center justify-center gap-2"
                                                        >
                                                            <Send className="w-3.5 h-3.5" /> 간편 지원하기
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </StandardCard>

                            {/* Job Summary Card - Redesigned as requested */}
                            <div className="bg-zinc-900/40 border border-white/[0.05] rounded-xl p-5 relative overflow-hidden">
                                <h5 className="font-black text-zinc-500 text-[10px] uppercase tracking-widest mb-4">공고 요약</h5>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-[12px]">
                                        <span className="text-zinc-500">과목/분야</span>
                                        <span className="font-bold text-zinc-200">{job.subjects?.[0] || '전체'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[12px]">
                                        <span className="text-zinc-500">지역</span>
                                        <span className="font-bold text-zinc-200">{job.regions?.[0] || '전체'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[12px]">
                                        <span className="text-zinc-500">모집 인원</span>
                                        <span className="font-bold text-zinc-200">1명</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[12px]">
                                        <span className="text-zinc-500">예산 규모</span>
                                        <span className="font-bold text-blue-400">
                                            {job.budget === '0' || !job.budget ? '교육청 지침' : `${Number(job.budget).toLocaleString()}원`}
                                        </span>
                                    </div>
                                </div>
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
                jobType={(job.jobType || 'TEACHER_HIRING') as 'TEACHER_HIRING' | 'EVENT_VENDOR'}
                jobTitle={job.title}
            />
        </DashboardLayout>
    );
}
