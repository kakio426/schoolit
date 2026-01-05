"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProfileBadge from '@/components/ui/ProfileBadge';
import FileUpload from '@/components/ui/FileUpload';
import BusinessProfileForm from '@/components/profile/BusinessProfileForm';
import BusinessPortfolioManager from '@/components/profile/BusinessPortfolioManager';
import { useProfile } from '@/hooks/useProfile';

import SchoolProfileForm from '@/components/profile/SchoolProfileForm';
import TeacherProfileForm from '@/components/profile/TeacherProfileForm';

export default function ProfilePage() {
    const { user, token, refreshProfile } = useAuth();
    const { certifications, fetchCertifications } = useProfile();

    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const isBusiness = user?.role === 'BUSINESS';
    const isSchool = user?.role === 'SCHOOL';

    useEffect(() => {
        // Init logic moved to child components
    }, [user]);



    if (!user) return null;

    const isVerified = isBusiness
        ? user.businessProfile?.isVerified
        : isSchool
            ? false // School verification logic later
            : user.teacherProfile?.isVerified;

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">프로필 관리</h1>
                        <p className="text-foreground-muted text-sm mt-1">나의 정보와 자격을 관리하세요.</p>
                    </div>
                    <ProfileBadge isVerified={isVerified || false} />
                </div>

                {isBusiness ? (
                    <>
                        <BusinessProfileForm user={user} token={token} onRefresh={refreshProfile} />
                        <BusinessPortfolioManager portfolios={user.businessProfile?.portfolios || []} token={token} onRefresh={refreshProfile} />
                    </>
                ) : isSchool ? (
                    <SchoolProfileForm user={user} token={token} onRefresh={refreshProfile} />
                ) : (
                    <TeacherProfileForm user={user} token={token} onRefresh={refreshProfile} />
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
