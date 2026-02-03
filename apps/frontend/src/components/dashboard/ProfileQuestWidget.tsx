"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import StandardCard from '../ui/StandardCard';

export default function ProfileQuestWidget() {
    const { user } = useAuth();
    const router = useRouter();
    const [quests, setQuests] = useState<any[]>([]);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!user) return;

        const newQuests = [];
        let completedCount = 0;

        // 1. Basic Info
        if (user.phone) {
            newQuests.push({ id: 'phone', label: '연락처 등록', completed: true });
            completedCount++;
        } else {
            newQuests.push({ id: 'phone', label: '연락처 등록', completed: false, link: '/dashboard/settings' });
        }

        // 2. Profile Image & Bio (Role specific)
        if (user.role === 'TEACHER') {
            const profile = user.teacherProfile;
            if (profile?.profileImage) {
                newQuests.push({ id: 'photo', label: '프로필 사진', completed: true });
                completedCount++;
            } else {
                newQuests.push({ id: 'photo', label: '프로필 사진', completed: false, link: '/dashboard/profile/edit' });
            }

            if (profile?.bio && profile.bio.length > 10) {
                newQuests.push({ id: 'bio', label: '자기소개 작성', completed: true });
                completedCount++;
            } else {
                newQuests.push({ id: 'bio', label: '자기소개 작성', completed: false, link: '/dashboard/profile/edit' });
            }

            if (profile?.experiences && profile.experiences.length > 0) {
                newQuests.push({ id: 'exp', label: '경력 1개 이상', completed: true });
                completedCount++;
            } else {
                newQuests.push({ id: 'exp', label: '경력 등록하기', completed: false, link: '/dashboard/profile/edit' });
            }
        } else if (user.role === 'BUSINESS') {
            const profile = user.businessProfile;
            if (profile?.companyName && profile.companyName !== 'New Company') {
                newQuests.push({ id: 'name', label: '업체명 설정', completed: true });
                completedCount++;
            } else {
                newQuests.push({ id: 'name', label: '업체명 설정', completed: false, link: '/dashboard/profile/edit' });
            }

            if (profile?.portfolios && profile.portfolios.length > 0) {
                newQuests.push({ id: 'portfolio', label: '포트폴리오 등록', completed: true });
                completedCount++;
            } else {
                newQuests.push({ id: 'portfolio', label: '포트폴리오 등록', completed: false, link: '/dashboard/profile' });
            }
        } else {
            // General or School
            return;
        }

        setQuests(newQuests);
        setProgress(Math.round((completedCount / newQuests.length) * 100));

    }, [user]);

    if (!quests.length || progress === 100) return null;

    return (
        <StandardCard className="p-5 space-y-4 border-l-4 border-l-primary/50">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <span>🚀</span> 프로필 완성 퀘스트
                </h3>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">{progress}%</span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                    className="bg-primary h-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <div className="space-y-2">
                {quests.map((q) => (
                    <div
                        key={q.id}
                        onClick={() => q.link && router.push(q.link)}
                        className={`flex items-center gap-3 p-2 rounded-lg text-sm transition-colors ${q.completed
                                ? 'text-slate-400 bg-slate-50 dark:bg-whole/5 line-through decoration-slate-400'
                                : 'text-slate-700 dark:text-slate-200 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 cursor-pointer shadow-sm border border-slate-100 dark:border-white/5'
                            }`}
                    >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 border ${q.completed
                                ? 'bg-slate-200 border-slate-300 text-slate-500'
                                : 'bg-primary/10 border-primary text-primary'
                            }`}>
                            {q.completed ? '✓' : '!'}
                        </div>
                        <span className="flex-1">{q.label}</span>
                        {!q.completed && <span className="text-xs text-primary font-bold">Go →</span>}
                    </div>
                ))}
            </div>

            <p className="text-xs text-slate-400 text-center">
                프로필을 완성하면 매칭 확률이 <strong>2배</strong> 올라갑니다!
            </p>
        </StandardCard>
    );
}
