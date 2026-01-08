
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { BusinessProfile, BusinessPortfolio } from '@/types';
import Link from 'next/link';

export default function BusinessDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const [profile, setProfile] = useState<any>(null); // Extended profile with user details
    const [reviews, setReviews] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [myJobs, setMyJobs] = useState<any[]>([]);
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

    const businessUserId = Number(id);

    useEffect(() => {
        if (businessUserId) {
            fetchData();
        }
    }, [businessUserId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [profileData, reviewsData, statsData] = await Promise.all([
                api.get(`/business-profiles/${businessUserId}`),
                api.get(`/reviews/received/${businessUserId}`),
                api.get(`/reviews/stats/${businessUserId}`)
            ]);
            setProfile(profileData);
            setReviews(reviewsData as any[]);
            setStats(statsData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyJobs = async () => {
        try {
            // Teacher gets their own jobs (Event Requests)
            // Endpoint /jobs returns all matching. 
            // Teachers should filter by Author? 
            // Actually api.get('/jobs') currently returns all public.
            // But we need "My Created Jobs".
            // Since we updated JobsService, filter logic in Frontend needs to match.
            // We'll iterate and find ones where teacherProfile.userId === user.id
            const allJobs = await api.get<any[]>('/jobs');
            const mine = allJobs.filter((j) => j.teacherProfile?.userId === user?.id && j.active);
            setMyJobs(mine);
        } catch (e) {
            console.error(e);
        }
    };

    const openOfferModal = () => {
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }
        fetchMyJobs();
        setIsOfferModalOpen(true);
    };

    const sendOffer = async (jobId: number) => {
        if (!businessUserId) return;
        try {
            // Reuse the suggest endpoint: /applications/:jobId/suggest
            // Body: { teacherUserId: businessUserId } 
            // (Note: Backend logic handles "candidate" check. We might need to ensure backend allows Business as candidate)
            // Wait, ApplicationsService.suggestJob checks:
            // const teacher = await this.prisma.user.findUnique({ where: { id: teacherUserId, role: 'TEACHER' } });
            // It restrict to TEACHER role!!!
            // This will FAIL for Business.

            // WE NEED TO FIX BACKEND first.
            await api.post(`/applications/${jobId}/suggest`, { teacherUserId: businessUserId });
            alert('제안을 보냈습니다!');
            setIsOfferModalOpen(false);
        } catch (e: any) {
            alert(e.message || '오류가 발생했습니다.');
        }
    };

    if (loading) return <DashboardLayout><div className="p-8 text-center">로딩 중...</div></DashboardLayout>;
    if (!profile) return <DashboardLayout><div className="p-8 text-center">업체 정보를 찾을 수 없습니다.</div></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Link href="/dashboard/business" className="inline-block mb-4 text-sm text-gray-500 hover:text-gray-800">
                    ← 목록으로 돌아가기
                </Link>

                {/* Profile Header */}
                <div className="bg-surface rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm mb-8">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-32 h-32 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-4xl ring-1 ring-indigo-100 dark:ring-indigo-800 shrink-0">
                            🏢
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                {profile.isVerified && (
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-bold">인증된 파트너 ✅</span>
                                )}
                                <span className="text-xs text-gray-500">
                                    가입일: {new Date(profile.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold text-foreground mb-2">{profile.companyName}</h1>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {profile.categories?.map((cat: string) => (
                                    <span key={cat} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm rounded-lg">
                                        {cat}
                                    </span>
                                ))}
                            </div>
                            <p className="text-foreground-muted whitespace-pre-wrap leading-relaxed">
                                {profile.description || '소개글이 없습니다.'}
                            </p>

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={openOfferModal}
                                    className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">
                                    제안 보내기
                                </button>
                                {profile.website && (
                                    <a href={profile.website} target="_blank" rel="noreferrer" className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-foreground font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                                        홈페이지 방문
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-surface p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <h3 className="font-bold text-lg mb-4 text-foreground">📍 기본 정보</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">주소</span>
                                <span className="text-foreground font-medium">{profile.address || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">세금계산서 발행</span>
                                <span className="text-foreground font-medium">{profile.canIssueTaxInvoice ? '가능' : '불가능'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">S2B 등록번호</span>
                                <span className="text-foreground font-medium">{profile.s2bNumber || '-'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <h3 className="font-bold text-lg mb-4 text-foreground">⭐ 평판 요약</h3>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="text-4xl font-bold text-foreground">{stats?.averageRating.toFixed(1) || '0.0'}</div>
                            <div className="text-sm text-gray-500">
                                <div>총 {stats?.totalReviews || 0}개의 리뷰</div>
                                <div>재계약 희망률 {stats?.reMatchRate || 0}%</div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {stats?.topKeywords?.map((k: any) => (
                                <span key={k.keyword} className="px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-xs rounded-md border border-yellow-100 dark:border-yellow-900/30">
                                    {k.keyword} {k.count}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Portfolios */}
                {profile.portfolios && profile.portfolios.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold mb-4 text-foreground">📸 포트폴리오</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {profile.portfolios.map((p: any) => (
                                <div key={p.id} className="relative aspect-video rounded-xl bg-gray-100 overflow-hidden group cursor-pointer">
                                    {p.images?.[0] ? (
                                        <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                    )}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-white text-sm font-bold">{p.title}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Reviews */}
                <div>
                    <h2 className="text-xl font-bold mb-4 text-foreground">📝 리뷰 ({reviews.length})</h2>
                    <div className="space-y-4">
                        {reviews.length === 0 ? (
                            <div className="text-center py-10 text-gray-500 bg-surface rounded-2xl border border-slate-200 dark:border-slate-700">
                                등록된 리뷰가 없습니다.
                            </div>
                        ) : (
                            reviews.map((review) => (
                                <div key={review.id} className="bg-surface p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <div className="flex justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-foreground">{review.sender?.name} 선생님</span>
                                            <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex text-yellow-400 text-sm">
                                            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                        </div>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm">{review.content}</p>
                                    {review.tags && review.tags.length > 0 && (
                                        <div className="flex gap-1 mt-3">
                                            {review.tags.map((tag: string) => (
                                                <span key={tag} className="text-xs text-gray-400">#{tag}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            {/* Offer Modal */}
            {
                isOfferModalOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={() => setIsOfferModalOpen(false)}>
                        <div className="bg-surface w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-700" onClick={e => e.stopPropagation()}>
                            <h3 className="text-xl font-bold mb-2 text-foreground">제안할 공고 선택</h3>
                            <p className="text-foreground-muted mb-6 text-sm">업체에게 제안을 보낼 행사 공고를 선택해주세요.</p>

                            <div className="space-y-3 max-h-[300px] overflow-y-auto mb-6 pr-2">
                                {myJobs.length === 0 ? (
                                    <div className="text-center py-8 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <div className="text-4xl mb-3">📭</div>
                                        <div className="text-foreground font-bold mb-1">보낼 수 있는 공고가 없어요</div>
                                        <div className="text-xs text-foreground-muted mb-4">먼저 행사를 요청하는 공고를 등록해주세요.</div>
                                        <Link href="/dashboard/jobs/new" className="inline-block px-5 py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary/90 transition-colors">
                                            새 행사 요청하기
                                        </Link>
                                    </div>
                                ) : (
                                    myJobs.map(job => (
                                        <button
                                            key={job.id}
                                            onClick={() => sendOffer(job.id)}
                                            className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 transition-all group bg-surface hover:shadow-sm"
                                        >
                                            <div className="font-bold text-foreground group-hover:text-primary transition-colors">{job.title}</div>
                                            <div className="text-xs text-foreground-muted mt-1">{job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '-'}</div>
                                        </button>
                                    ))
                                )}
                            </div>

                            <button
                                onClick={() => setIsOfferModalOpen(false)}
                                className="w-full py-3 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                            >
                                취소
                            </button>
                        </div>
                    </div>
                )
            }
        </DashboardLayout >
    );
}

