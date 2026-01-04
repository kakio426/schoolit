"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import { SchoolProfile } from '@/types';

export default function SchoolProfilePage() {
    const { user, refreshProfile } = useAuth();
    const [profile, setProfile] = useState({
        schoolName: '',
        address: '',
        website: '',
        description: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user?.role === 'SCHOOL') {
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            const data = await api.get<SchoolProfile>(`/users/school/profile`);
            if (data && data.userId) {
                setProfile({
                    schoolName: data.schoolName || '',
                    address: data.address || '',
                    website: data.website || '',
                    description: data.description || '',
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage('');

        try {
            await api.patch('/users/school/profile', profile);
            setMessage('프로필이 저장되었습니다. ✅');
            refreshProfile();
        } catch (err: any) {
            console.error(err);
            setMessage(err.message || '저장에 실패했습니다. ❌');
        } finally {
            setIsSaving(false);
        }
    };

    if (user?.role !== 'SCHOOL') {
        return (
            <DashboardLayout>
                <div className="text-center py-20 text-red-500 font-bold">접근 권한이 없습니다 (학교 계정 전용).</div>
            </DashboardLayout>
        )
    }

    if (isLoading) {
        return <DashboardLayout><div>로딩 중...</div></DashboardLayout>
    }

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="text-2xl font-bold text-foreground mb-6">🏫 학교 프로필 관리</h1>

                <div className="bg-surface rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">학교/기관명</label>
                            <input
                                type="text"
                                name="schoolName"
                                value={profile.schoolName}
                                onChange={handleChange}
                                placeholder="예: 서울고등학교"
                                className="w-full px-4 py-3 bg-surface rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-foreground"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">주소</label>
                            <input
                                type="text"
                                name="address"
                                value={profile.address}
                                onChange={handleChange}
                                placeholder="전체 주소를 입력해주세요"
                                className="w-full px-4 py-3 bg-surface rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-foreground"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">웹사이트</label>
                            <input
                                type="url"
                                name="website"
                                value={profile.website}
                                onChange={handleChange}
                                placeholder="https://school.example.com"
                                className="w-full px-4 py-3 bg-surface rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-foreground"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">소개글</label>
                            <textarea
                                name="description"
                                value={profile.description}
                                onChange={handleChange}
                                placeholder="학교의 비전이나 소개를 간단히 입력해주세요."
                                rows={4}
                                className="w-full px-4 py-3 bg-surface rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none text-foreground"
                            />
                        </div>

                        {message && (
                            <div className={`p-4 rounded-xl text-center font-bold ${message.includes('✅') ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400'}`}>
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSaving ? '저장 중...' : '프로필 저장하기'}
                        </button>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
