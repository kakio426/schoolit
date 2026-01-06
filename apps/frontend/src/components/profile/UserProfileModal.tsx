"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { User } from '@/types';
import { Role } from '@/lib/constants';
import TeacherProfileView from './TeacherProfileView';
import BusinessProfileView from './BusinessProfileView';

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: number;
}

export default function UserProfileModal({ isOpen, onClose, userId }: UserProfileModalProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen && userId) {
            fetchProfile();
        }
    }, [isOpen, userId]);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const data = await api.get<User>(`/users/${userId}/profile`);
            setUser(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-surface w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[32px] shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-700 flex flex-col">

                {/* Header */}
                <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-start bg-surface sticky top-0 z-10">
                    <h2 className="text-2xl font-bold text-foreground">상세 프로필</h2>
                    <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                        <span className="text-2xl">×</span>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                            <p className="text-foreground-muted animate-pulse">프로필 정보를 불러오는 중...</p>
                        </div>
                    ) : !user ? (
                        <div className="text-center py-20 text-foreground-muted">
                            사용자 정보를 찾을 수 없습니다.
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Identity Section */}
                            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                                <div className="w-24 h-24 rounded-[2rem] bg-slate-100 dark:bg-slate-800 ring-4 ring-white dark:ring-slate-700 shadow-lg overflow-hidden flex items-center justify-center text-4xl shrink-0">
                                    {(user.teacherProfile?.profileImage || user.schoolProfile?.logoImage) ? (
                                        <img
                                            src={user.teacherProfile?.profileImage || user.schoolProfile?.logoImage}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span>{(user.role === Role.BUSINESS ? '🏢' : user.role === Role.SCHOOL ? '🏫' : '👨‍🏫')}</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-col md:flex-row items-center md:items-start gap-2 mb-2">
                                        <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                                            {user.role === Role.BUSINESS ? user.businessProfile?.companyName : user.name}
                                            {user.role === Role.TEACHER && <span className="text-base font-normal text-foreground-muted hidden md:inline">선생님</span>}
                                        </h3>
                                        {user.teacherProfile?.isVerified && (
                                            <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-md border border-blue-100 dark:border-blue-800">신원인증됨</span>
                                        )}
                                        {user.businessProfile?.s2bNumber && (
                                            <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[10px] font-bold rounded-md border border-purple-100 dark:border-purple-800">S2B 등록업체</span>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                                        {user.role === Role.TEACHER && user.teacherProfile?.subjects.map(s => (
                                            <span key={s} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold">{s}</span>
                                        ))}
                                        {user.role === Role.BUSINESS && user.businessProfile?.categories.map(c => (
                                            <span key={c} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold">{c}</span>
                                        ))}
                                    </div>

                                    {/* Bio / Description */}
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-sm text-foreground-muted leading-relaxed whitespace-pre-wrap text-left">
                                        {user.teacherProfile?.bio || user.businessProfile?.description || user.schoolProfile?.description || '소개글이 없습니다.'}
                                    </div>
                                </div>
                            </div>

                            {/* TEACHER SPECIFIC */}
                            {user.role === Role.TEACHER && user.teacherProfile && (
                                <TeacherProfileView user={user} />
                            )}

                            {/* BUSINESS SPECIFIC */}
                            {user.role === Role.BUSINESS && user.businessProfile && (
                                <BusinessProfileView user={user} />
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 md:p-6 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/30 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-foreground font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}
