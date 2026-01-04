"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { AdminStatsCard } from '@/components/admin/AdminStatsCard';
import { UserTable } from '@/components/admin/UserTable';

export default function AdminPage() {
    const { token, user, isLoading: authLoading } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'USERS' | 'CERTS'>('OVERVIEW');
    const [pendingCerts, setPendingCerts] = useState<any[]>([]);

    useEffect(() => {
        if (token) {
            fetchStats();
            fetchPending();
        }
    }, [token]);

    const fetchStats = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/admin/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setStats(await res.json());
        } catch (e) {
            console.error(e);
        }
    };

    const fetchPending = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/admin/certifications/pending`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                setPendingCerts(await response.json());
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleStatusUpdate = async (id: number, status: 'APPROVED' | 'REJECTED') => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/admin/certifications/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            });

            if (response.ok) {
                fetchPending();
            }
        } catch (err) {
            console.error('Failed to update status');
        }
    };

    if (authLoading) return <div className="p-10 text-center">Loading...</div>;

    if (user?.role !== 'ADMIN') {
        return (
            <DashboardLayout>
                <div className="text-center py-20">
                    <p className="text-red-500 font-bold">접근 권한이 없습니다.</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">관리자 대시보드</h1>
                    <p className="text-foreground-muted">전체 시스템 현황을 한눈에 파악하고 관리하세요.</p>
                </div>

                {/* Tabs */}
                <div className="border-b border-slate-200 dark:border-slate-700">
                    <nav className="-mb-px flex gap-6" aria-label="Tabs">
                        {['OVERVIEW', 'USERS', 'CERTS'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`
                                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all
                                    ${activeTab === tab
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-foreground-muted hover:text-foreground hover:border-slate-300'}
                                `}
                            >
                                {tab === 'OVERVIEW' && '종합 개요'}
                                {tab === 'USERS' && '사용자 관리'}
                                {tab === 'CERTS' && '인증 승인'}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                {activeTab === 'OVERVIEW' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <AdminStatsCard title="총 사용자" value={stats?.totalUsers || 0} icon="👥" description="이번 주 +12명" />
                        <AdminStatsCard title="활성 공고" value={stats?.totalJobs || 0} icon="📢" description="신규 등록 5건" />
                        <AdminStatsCard title="등록된 학교" value={stats?.totalSchools || 0} icon="🏫" description="인증 대기 2건" />
                        <AdminStatsCard title="선생님 풀" value={stats?.totalTeachers || 0} icon="🎓" description="프로필 완성률 85%" />
                    </div>
                )}

                {activeTab === 'USERS' && (
                    <UserTable />
                )}

                {activeTab === 'CERTS' && (
                    <div className="bg-surface rounded-[32px] border border-slate-200/50 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-200/50 dark:border-slate-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-foreground">인증 대기 목록</h2>
                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">{pendingCerts.length}건</span>
                        </div>

                        {pendingCerts.length === 0 ? (
                            <div className="p-20 text-center text-foreground-muted">
                                <div className="text-4xl mb-4">✨</div>
                                대기 중인 인증 요청이 없습니다.
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {pendingCerts.map((cert) => (
                                    <div key={cert.id} className="p-6 md:p-8 flex items-center justify-between hover:bg-surface-hover transition-colors">
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl">
                                                📄
                                            </div>
                                            <div>
                                                <div className="font-bold text-foreground text-lg mb-1">{cert.teacherProfile.user.name}</div>
                                                <div className="text-sm text-foreground-muted mb-2">{cert.teacherProfile.user.email}</div>
                                                <div className="flex items-center gap-3">
                                                    <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-xs font-medium text-foreground-muted">
                                                        {cert.name}
                                                    </span>
                                                    <a
                                                        href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${cert.fileUrl}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary text-xs font-bold hover:underline flex items-center gap-1"
                                                    >
                                                        파일 열기 ↗
                                                    </a>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleStatusUpdate(cert.id, 'APPROVED')}
                                                className="px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                                            >
                                                차 승인
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(cert.id, 'REJECTED')}
                                                className="px-6 py-3 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-xl text-sm font-bold hover:bg-red-200 dark:hover:bg-red-900/50 transition-all active:scale-95"
                                            >
                                                반려
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
