"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import { JobListing, JobApplication } from '@/types';
import { Role } from '@/lib/constants';

export default function JobDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [job, setJob] = useState<JobListing | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [isApplying, setIsApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);

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

    const handleApply = async () => {
        if (!message.trim()) {
            alert('지원 메시지를 입력해주세요.');
            return;
        }
        setIsApplying(true);
        try {
            await api.post(`/applications/${id}/apply`, { message });
            alert('지원이 완료되었습니다!');
            setHasApplied(true);
            router.push('/dashboard/applications');
        } catch (e: any) {
            alert(e.message || '지원 중 오류가 발생했습니다.');
        } finally {
            setIsApplying(false);
        }
    };

    if (isLoading) return <DashboardLayout><div className="text-center py-20 text-foreground-muted">로딩 중...</div></DashboardLayout>;
    if (!job) return <DashboardLayout><div className="text-center py-20 text-foreground-muted">공고를 찾을 수 없습니다.</div></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                <button
                    onClick={() => router.back()}
                    className="mb-6 text-foreground-muted hover:text-foreground transition-colors flex items-center gap-2 group"
                >
                    <span className="group-hover:-translate-x-1 transition-transform">←</span> 뒤로 가기
                </button>

                <div className="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden border-b-4 border-b-primary/20">
                    <div className="p-8 md:p-12 border-b border-border bg-background/30 dark:bg-background/10">
                        <div className="flex flex-wrap gap-2 mb-6">
                            {job.subjects?.map((s: string) => (
                                <span key={s} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-full border border-blue-200 dark:border-blue-800">
                                    {s}
                                </span>
                            ))}
                            {job.regions?.map((r: string) => (
                                <span key={r} className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-bold rounded-full border border-orange-200 dark:border-orange-800">
                                    {r}
                                </span>
                            ))}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight">{job.title}</h1>
                        <div className="flex flex-wrap items-center gap-4 md:gap-6 text-foreground-muted">
                            <div className="flex items-center gap-2 bg-surface px-4 py-2 rounded-2xl border border-border shadow-sm">
                                <span className="text-xl">🏫</span>
                                <span className="font-bold text-foreground">
                                    {job.schoolProfile?.schoolName || (job as any).teacherProfile?.user?.name || '작성자 정보 없음'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>📅</span>
                                <span>{job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '-'} 등록</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${job.active ? 'bg-success' : 'bg-error'} animate-pulse`}></span>
                                <span className="font-bold">{job.active ? '모집 중' : '모집 마감'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-12">
                        <div className="mb-12">
                            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                                공고 상세 내용
                            </h2>
                            <div className="text-foreground leading-relaxed whitespace-pre-wrap text-lg bg-background p-8 rounded-3xl border border-border">
                                {job.description}
                            </div>
                        </div>

                        <div className="bg-surface-hover dark:bg-surface/50 rounded-3xl p-8 border border-border">
                            <h2 className="text-xl font-bold text-foreground mb-6">📍 상세 요건</h2>

                            {/* Teacher Hiring Details */}
                            {(job as any).jobType === 'TEACHER_HIRING' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm mb-8 pb-8 border-b border-border">
                                    <div>
                                        <div className="text-foreground-muted mb-2 font-medium">계약 기간</div>
                                        <div className="text-foreground font-bold text-base">{(job as any).contractPeriod || '협의'}</div>
                                    </div>
                                    <div>
                                        <div className="text-foreground-muted mb-2 font-medium">주당 수업 시수</div>
                                        <div className="text-foreground font-bold text-base">{(job as any).teachingHours ? `${(job as any).teachingHours}시간` : '협의'}</div>
                                    </div>
                                    <div>
                                        <div className="text-foreground-muted mb-2 font-medium">담당 학년</div>
                                        <div className="flex flex-wrap gap-2">
                                            {(job as any).gradeLevel?.length > 0
                                                ? (job as any).gradeLevel.map((lvl: string) => (
                                                    <span key={lvl} className="px-2 py-1 bg-surface dark:bg-slate-700/50 rounded border border-border font-bold text-foreground">
                                                        {lvl}
                                                    </span>
                                                ))
                                                : <span className="text-foreground font-bold text-base">무관</span>
                                            }
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Event Vendor Details */}
                            {(job as any).jobType === 'EVENT_VENDOR' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm mb-8 pb-8 border-b border-border">
                                    <div>
                                        <div className="text-foreground-muted mb-2 font-medium">행사 종류</div>
                                        <div className="text-foreground font-bold text-base">{(job as any).eventType || '기타'}</div>
                                    </div>
                                    <div>
                                        <div className="text-foreground-muted mb-2 font-medium">행사 기간/시간</div>
                                        <div className="text-foreground font-bold text-base">{(job as any).eventDuration || '협의'}</div>
                                    </div>
                                    <div>
                                        <div className="text-foreground-muted mb-2 font-medium">참가 예상 인원</div>
                                        <div className="text-foreground font-bold text-base">{(job as any).participantCount || '미정'}</div>
                                    </div>
                                    <div>
                                        <div className="text-foreground-muted mb-2 font-medium">장비/교구 제공</div>
                                        <div className="text-foreground font-bold text-base">{(job as any).equipmentProvided ? '학교 제공 불필요 (업체 지참)' : '학교 제공 필요'}</div>
                                    </div>
                                    <div className="col-span-1 md:col-span-2">
                                        <div className="text-foreground-muted mb-2 font-medium">필수 자격 요건</div>
                                        <div className="flex flex-wrap gap-2">
                                            {(job as any).certifications?.length > 0
                                                ? (job as any).certifications.map((cert: string) => (
                                                    <span key={cert} className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg border border-purple-200 dark:border-purple-800 font-bold">
                                                        {cert}
                                                    </span>
                                                ))
                                                : <span className="text-foreground-muted">-</span>
                                            }
                                        </div>
                                    </div>
                                </div>
                            )}

                            <h2 className="text-xl font-bold text-foreground mb-6">
                                {job.schoolProfile ? '🏫 학교 정보' : '👤 요청자 정보'}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                                {job.schoolProfile ? (
                                    <>
                                        <div>
                                            <div className="text-foreground-muted mb-2 font-medium">학교 위치</div>
                                            <div className="text-foreground font-bold text-base">{job.schoolProfile.address || '정보 없음'}</div>
                                        </div>
                                        <div>
                                            <div className="text-foreground-muted mb-2 font-medium">홈페이지</div>
                                            <div className="text-foreground font-bold text-base">
                                                {job.schoolProfile.website ? (
                                                    <a href={job.schoolProfile.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                                                        {job.schoolProfile.website} ↗
                                                    </a>
                                                ) : '정보 없음'}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <div className="text-foreground-muted mb-2 font-medium">요청자</div>
                                            <div className="text-foreground font-bold text-base">{(job as any).teacherProfile?.user?.name || '정보 없음'}</div>
                                        </div>
                                        <div>
                                            <div className="text-foreground-muted mb-2 font-medium">비고</div>
                                            <div className="text-foreground font-bold text-base">선생님 개별 요청</div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>


                        {/* Application Section */}
                        {((user?.role === Role.TEACHER || user?.role === 'BUSINESS') &&
                            user.id !== job.schoolProfile?.userId &&
                            user.id !== (job as any).teacherProfile?.userId) && (
                                <div className="mt-12 border-t border-border pt-12">
                                    {hasApplied ? (
                                        <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 text-green-700 dark:text-green-400 p-8 rounded-3xl text-center shadow-inner">
                                            <div className="text-4xl mb-4">✅</div>
                                            <div className="text-xl font-bold mb-2">이미 지원한 공고입니다.</div>
                                            <div className="text-sm">지원 현황에서 진행 상태를 확인하세요.</div>
                                            <Link href="/dashboard/applications" className="mt-6 inline-block px-6 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all">지원 현황 보기</Link>
                                        </div>
                                    ) : (
                                        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                                            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                                                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                                                이 공고에 지원하기
                                            </h2>

                                            {/* Permission Check */}
                                            {((job as any).jobType === 'EVENT_VENDOR' && user.role !== 'BUSINESS') ? (
                                                <div className="p-6 bg-amber-50 text-amber-800 rounded-2xl border border-amber-200">
                                                    ⚠️ 행사 업체 공고는 <strong>기업/사업자(Business)</strong> 계정만 지원할 수 있습니다.
                                                </div>
                                            ) : ((job as any).jobType === 'TEACHER_HIRING' && user.role !== 'TEACHER') ? (
                                                <div className="p-6 bg-amber-50 text-amber-800 rounded-2xl border border-amber-200">
                                                    ⚠️ 기간제 교사 공고는 <strong>선생님(Teacher)</strong> 계정만 지원할 수 있습니다.
                                                </div>
                                            ) : (
                                                /* Eligible to Apply */
                                                <div className="space-y-4">
                                                    {(job as any).jobType === 'EVENT_VENDOR' && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm font-bold text-foreground mb-2">제안 금액 (단위: 원)</label>
                                                                <input
                                                                    type="text"
                                                                    id="proposalCost"
                                                                    className="w-full px-4 py-3 rounded-xl outline-none focus:border-primary"
                                                                    placeholder="예: 1,500,000"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-bold text-foreground mb-2">담당자 연락처</label>
                                                                <input
                                                                    type="text"
                                                                    id="contactInfo"
                                                                    className="w-full px-4 py-3 rounded-xl outline-none focus:border-primary"
                                                                    placeholder="예: 010-1234-5678 (김철수 매니저)"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div>
                                                        <label className="block text-sm font-bold text-foreground mb-2">
                                                            {(job as any).jobType === 'EVENT_VENDOR' ? '상세 제안 내용' : '자기소개 및 메시지'}
                                                        </label>
                                                        <textarea
                                                            value={message}
                                                            onChange={(e) => setMessage(e.target.value)}
                                                            placeholder={(job as any).jobType === 'EVENT_VENDOR'
                                                                ? "행사 프로그램 구성, 강점 등 상세 제안 내용을 입력해주세요.\n포트폴리오 링크를 포함하면 좋습니다."
                                                                : "학교 담당자에게 보낼 자기소개나 메시지를 간단히 입력해주세요."}
                                                            className="w-full h-40 p-6 rounded-3xl outline-none focus:border-primary resize-none shadow-sm"
                                                        />
                                                    </div>

                                                    <button
                                                        onClick={async () => {
                                                            const costInput = document.getElementById('proposalCost') as HTMLInputElement;
                                                            const contactInput = document.getElementById('contactInfo') as HTMLInputElement;

                                                            let finalMessage = message;

                                                            if ((job as any).jobType === 'EVENT_VENDOR') {
                                                                const cost = costInput?.value || '미기재';
                                                                const contact = contactInput?.value || '미기재';

                                                                if (!costInput?.value || !contactInput?.value || !message.trim()) {
                                                                    alert('모든 필드를 입력해주세요.');
                                                                    return;
                                                                }

                                                                finalMessage = `[제안서 요약]\n- 제안 금액: ${cost}\n- 담당자: ${contact}\n\n[상세 내용]\n${message}`;
                                                            } else {
                                                                if (!message.trim()) {
                                                                    alert('지원 메시지를 입력해주세요.');
                                                                    return;
                                                                }
                                                            }

                                                            setIsApplying(true);
                                                            try {
                                                                await api.post(`/applications/${id}/apply`, { message: finalMessage });
                                                                alert('지원이 완료되었습니다!');
                                                                setHasApplied(true);
                                                                router.push('/dashboard/applications');
                                                            } catch (e: any) {
                                                                alert(e.message || '지원 중 오류가 발생했습니다.');
                                                            } finally {
                                                                setIsApplying(false);
                                                            }
                                                        }}
                                                        disabled={isApplying || !job.active}
                                                        className="w-full py-5 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                                                    >
                                                        {isApplying ? '지원 중...' : job.active ? '지원서 제출하기' : '마감된 공고입니다'}
                                                    </button>
                                                    <p className="text-center text-foreground-muted text-xs mt-4 italic">
                                                        지원서를 제출하면 학교 담당자에게 알림이 전송됩니다.
                                                    </p>
                                                </div>
                                            )}
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
