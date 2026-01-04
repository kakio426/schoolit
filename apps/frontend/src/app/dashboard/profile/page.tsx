"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProfileBadge from '@/components/ui/ProfileBadge';
import FileUpload from '@/components/ui/FileUpload';
import BusinessProfileForm from '@/components/profile/BusinessProfileForm';
import BusinessPortfolioManager from '@/components/profile/BusinessPortfolioManager';
import { useProfile } from '@/hooks/useProfile';

export default function ProfilePage() {
    const { user, token, refreshProfile } = useAuth();
    const { updateTeacherProfile, certifications, fetchCertifications, isSaving } = useProfile();

    const [bio, setBio] = useState('');
    const [subjects, setSubjects] = useState<string[]>([]);
    const [regions, setRegions] = useState<string[]>([]);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const isBusiness = user?.role === 'BUSINESS';

    useEffect(() => {
        if (user?.teacherProfile) {
            setBio(user.teacherProfile.bio || '');
            setSubjects(user.teacherProfile.subjects || []);
            setRegions(user.teacherProfile.regions || []);
        }
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        const result = await updateTeacherProfile({ bio, subjects, regions });
        if (result.success) {
            setMessage({ type: 'success', text: '프로필이 저장되었습니다.' });
        } else {
            setMessage({ type: 'error', text: result.error || '저장에 실패했습니다.' });
        }
    };

    if (!user) return null;

    const isVerified = isBusiness
        ? user.businessProfile?.isVerified
        : user.teacherProfile?.isVerified;

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">프로필 관리</h1>
                        <p className="text-foreground-muted text-sm mt-1">나의 정보와 자격을 관리하세요.</p>
                    </div>
                    < ProfileBadge isVerified={isVerified || false} />
                </div>

                {isBusiness ? (
                    <>
                        <BusinessProfileForm user={user} token={token} onRefresh={refreshProfile} />
                        <BusinessPortfolioManager portfolios={user.businessProfile?.portfolios || []} token={token} onRefresh={refreshProfile} />
                    </>
                ) : (
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="bg-surface p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">자기소개</label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-surface rounded-2xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none text-foreground placeholder:text-foreground-muted"
                                    placeholder="선생님에 대해 학교에 소개해주세요."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">희망 과목 (쉼표로 구분)</label>
                                <input
                                    type="text"
                                    value={subjects.join(', ')}
                                    onChange={(e) => setSubjects(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                    className="w-full px-4 py-3 bg-surface rounded-2xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground placeholder:text-foreground-muted"
                                    placeholder="예: 드론, 코딩, 로봇"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">활동 가능 지역 (쉼표로 구분)</label>
                                <input
                                    type="text"
                                    value={regions.join(', ')}
                                    onChange={(e) => setRegions(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                    className="w-full px-4 py-3 bg-surface rounded-2xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground placeholder:text-foreground-muted"
                                    placeholder="예: 서울 강남구, 경기 판교"
                                />
                            </div>
                        </div>

                        {user.reviewStats && user.reviewStats.totalReviews > 0 && (
                            <div className="bg-surface p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
                                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                    <span>🎖️</span> 학교의 평가 지표
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10">
                                        <p className="text-sm font-semibold text-foreground-muted mb-1">학교 만족도</p>
                                        <p className="text-3xl font-black text-primary">
                                            {Math.round(user.reviewStats.reMatchRate)}%
                                        </p>
                                        <p className="text-xs text-foreground-muted mt-2">학교에서 "다시 일하고 싶어요"라고 응답한 비율</p>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-sm font-semibold text-amber-700 dark:text-amber-500">최우수 키워드</p>
                                            {user.reviewStats.isVeteran && (
                                                <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-black rounded uppercase tracking-tighter shadow-sm">
                                                    Veteran
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {user.reviewStats.topKeywords.map((kw, idx) => (
                                                <span key={idx} className="px-3 py-1 bg-white dark:bg-amber-900/40 rounded-full text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 shadow-sm">
                                                    #{kw.keyword}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {message && (
                            <div className={`p-4 rounded-2xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900/50' : 'bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/50'}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className={`px-8 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all ${isSaving ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
                            >
                                {isSaving ? '저장 중...' : '변경사항 저장'}
                            </button>
                        </div>
                    </form>
                )}

                {!isBusiness && (
                    <div className="mt-12 space-y-6">
                        <h2 className="text-xl font-bold text-foreground">자격증 및 증명서</h2>

                        <div className="bg-surface p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-8">
                            <FileUpload
                                token={token}
                                onUploadSuccess={() => {
                                    setMessage({ type: 'success', text: '인증 요청이 제출되었습니다.' });
                                    fetchCertifications();
                                }}
                            />

                            {certifications.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-foreground-muted uppercase tracking-wider">제출된 문서</h3>
                                    <div className="space-y-3">
                                        {certifications.map((cert) => (
                                            <div key={cert.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-xl">📄</span>
                                                    <div>
                                                        <p className="font-medium text-foreground">{cert.name}</p>
                                                        <p className="text-xs text-foreground-muted">{new Date(cert.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${cert.status === 'APPROVED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                        cert.status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                        }`}>
                                                        {cert.status === 'APPROVED' ? '승인됨' :
                                                            cert.status === 'REJECTED' ? '반려됨' : '심사중'}
                                                    </span>
                                                    <a
                                                        href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${cert.fileUrl}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary hover:underline text-sm font-semibold"
                                                    >
                                                        보기
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
