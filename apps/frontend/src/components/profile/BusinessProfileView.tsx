"use client";

import React from 'react';
import { User } from '@/types';

interface BusinessProfileViewProps {
    user: User;
}

/**
 * Displays detailed Business profile information.
 * Extracted from UserProfileModal for better maintainability.
 */
export default function BusinessProfileView({ user }: BusinessProfileViewProps) {
    const profile = user.businessProfile;
    if (!profile) return null;

    return (
        <>
            {/* Business Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="text-sm text-slate-500 mb-1">사업자정보</div>
                    <div className="font-bold text-foreground">{profile.companyName}</div>
                    <div className="text-xs text-foreground-muted mt-1">등록번호: {profile.registrationNum || '미입력'}</div>
                    <div className="text-xs text-foreground-muted">S2B 번호: {profile.s2bNumber || '-'}</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="text-sm text-slate-500 mb-1">연락처/웹사이트</div>
                    <div className="flex flex-col gap-1">
                        {profile.website && (
                            <a href={profile.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm font-medium truncate">
                                🌐 {profile.website}
                            </a>
                        )}
                        <div className="text-sm text-foreground">{profile.address || '주소 미입력'}</div>
                    </div>
                </div>
            </div>

            {/* Portfolios */}
            <div>
                <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <span>📂</span> 포트폴리오
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(!profile.portfolios || profile.portfolios.length === 0) ? (
                        <p className="text-foreground-muted text-sm ml-1 col-span-2">등록된 포트폴리오가 없습니다.</p>
                    ) : (
                        profile.portfolios.map((pf, idx) => (
                            <div key={idx} className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video bg-slate-100">
                                {pf.images && pf.images.length > 0 ? (
                                    <img src={pf.images[0]} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt={pf.title} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">이미지 없음</div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                                    <div className="text-white font-bold">{pf.title}</div>
                                    {pf.description && <div className="text-white/80 text-xs line-clamp-1">{pf.description}</div>}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
