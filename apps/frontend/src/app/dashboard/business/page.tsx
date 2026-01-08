
'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import Link from 'next/link';
import { BusinessProfile } from '@/types';

interface BusinessProfileWithUser extends BusinessProfile {
    user: {
        id: number;
        name: string;
        email: string;
    };
}

export default function BusinessListPage() {
    const { user } = useAuth();
    const [businesses, setBusinesses] = useState<BusinessProfileWithUser[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchBusinesses();
    }, []);

    const fetchBusinesses = async () => {
        setIsLoading(true);
        try {
            const data = await api.get<BusinessProfileWithUser[]>('/business-profiles');
            setBusinesses(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        🏢 파트너 업체 찾기
                    </h1>
                    <p className="text-foreground-muted mt-2">
                        학교 행사를 도와줄 전문 파트너들을 만나보세요.
                    </p>
                </div>

                {isLoading ? (
                    <div className="text-center py-20 text-foreground-muted">업체 목록을 불러오는 중...</div>
                ) : businesses.length === 0 ? (
                    <div className="text-center py-20 text-foreground-muted">아직 등록된 파트너 업체가 없습니다.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {businesses.map((biz) => (
                            <Link href={`/dashboard/business/${biz.user.id}`} key={biz.id} className="group">
                                <div className="bg-surface p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all h-full flex flex-col hover:-translate-y-1">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-14 h-14 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-2xl ring-1 ring-indigo-100 dark:ring-indigo-800">
                                            🏢
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                                                {biz.companyName}
                                            </h3>
                                            <p className="text-xs text-foreground-muted">
                                                {biz.user.name} 담당자
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4 flex-1">
                                        <p className="text-sm text-foreground-muted line-clamp-3">
                                            {biz.description || '업체 소개가 없습니다.'}
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                            {biz.categories?.map((cat) => (
                                                <span key={cat} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-md">
                                                    {cat}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                                        <span className={`px-2 py-1 rounded-full ${biz.isVerified ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {biz.isVerified ? '인증됨 ✅' : '미인증'}
                                        </span>
                                        <span className="text-primary font-medium">자세히 보기 →</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
