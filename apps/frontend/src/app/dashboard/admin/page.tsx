"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { AdminStatsCard } from '@/components/admin/AdminStatsCard';
import { UserTable } from '@/components/admin/UserTable';
import { api } from '@/lib/api';
import { CertStatus, API_BASE_URL } from '@/lib/constants';

export default function AdminPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'USERS' | 'CERTS' | 'BUSINESS'>('OVERVIEW');
    const [pendingCerts, setPendingCerts] = useState<any[]>([]);
    const [pendingBusiness, setPendingBusiness] = useState<any[]>([]);

    useEffect(() => {
        if (user?.role === 'ADMIN') {
            fetchStats();
            fetchPending();
            fetchPendingBusiness();
        }
    }, [user]);

    const fetchStats = async () => {
        try {
            const data = await api.get<any>('/admin/stats');
            setStats(data);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchPending = async () => {
        try {
            const data = await api.get<any[]>('/admin/certifications/pending');
            setPendingCerts(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleStatusUpdate = async (id: number, status: 'APPROVED' | 'REJECTED') => {
        try {
            await api.patch(`/admin/certifications/${id}/status`, { status });
            fetchPending();
        } catch (err) {
            console.error('Failed to update status');
        }
    };

    const fetchPendingBusiness = async () => {
        try {
            const data = await api.get<any[]>('/admin/business/pending');
            setPendingBusiness(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleBusinessVerify = async (id: number, isVerified: boolean) => {
        try {
            await api.patch(`/admin/business/${id}/verify`, { isVerified });
            fetchPendingBusiness();
        } catch (err) {
            console.error('Failed to verify business');
        }
    };

    if (authLoading) return <div className="p-10 text-center text-foreground">로딩 중...</div>;

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
                        {['OVERVIEW', 'USERS', 'CERTS', 'BUSINESS'].map((tab) => (
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
                                {tab === 'BUSINESS' && '기업 인증'}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                {activeTab === 'OVERVIEW' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <AdminStatsCard title="총 사용자" value={stats?.totalUsers || 0} icon="👥" description="이번 주 신규 등록" />
                        <AdminStatsCard title="활성 공고" value={stats?.totalJobs || 0} icon="📢" description="실시간 채용 중" />
                        <AdminStatsCard title="등록된 학교" value={stats?.totalSchools || 0} icon="🏫" description="활동 중인 기관" />
                        <AdminStatsCard title="선생님 풀" value={stats?.totalTeachers || 0} icon="🎓" description="검색 가능한 인재" />
                        <a href="/dashboard/admin/feedback" className="block transform transition-transform hover:scale-105 active:scale-95">
                            <AdminStatsCard title="피드백 센터" value="GO" icon="📢" description="접수된 의견 확인하기" />
                        </a>
                    </div>
                )}

                {activeTab === 'USERS' && (
                    <UserTable />
                )}

                {activeTab === 'CERTS' && (
                    <div className="bg-surface rounded-3xl border border-slate-200/50 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-200/50 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-foreground">인증 대기 목록</h2>
                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">{pendingCerts.length}건</span>
                        </div>

                        {pendingCerts.length === 0 ? (
                            <div className="p-20 text-center text-foreground-muted bg-surface">
                                <div className="text-5xl mb-6">✨</div>
                                <p className="text-lg font-medium">대기 중인 인증 요청이 없습니다.</p>
                                <p className="text-sm mt-1">모든 검토가 완료되었습니다.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {pendingCerts.map((cert) => (
                                    <div key={cert.id} className="p-6 md:p-8 flex items-center justify-between hover:bg-surface-hover transition-all bg-surface">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl shadow-inner">
                                                📄
                                            </div>
                                            <div>
                                                <div className="font-bold text-foreground text-lg mb-0.5">{cert.teacherProfile?.user?.name || 'Unknown'} 선생님</div>
                                                <div className="text-sm text-foreground-muted mb-3">{cert.teacherProfile?.user?.email || '-'}</div>
                                                <div className="flex items-center gap-3">
                                                    <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold text-foreground-muted border border-slate-200 dark:border-slate-700">
                                                        {cert.name}
                                                    </span>
                                                    <a
                                                        href={cert.fileUrl.startsWith('http') ? cert.fileUrl : `${API_BASE_URL}${cert.fileUrl}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary text-xs font-bold hover:underline flex items-center gap-1 bg-primary/5 px-3 py-1.5 rounded-xl"
                                                    >
                                                        증명서 보기 ↗
                                                    </a>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleStatusUpdate(cert.id, 'APPROVED')}
                                                className="px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all active:scale-95"
                                            >
                                                승인하기
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(cert.id, 'REJECTED')}
                                                className="px-6 py-3 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded-xl text-sm font-bold hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all active:scale-95"
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

                {activeTab === 'BUSINESS' && (
                    <div className="bg-surface rounded-3xl border border-slate-200/50 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-200/50 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-foreground">기업 인증 대기 목록</h2>
                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">{pendingBusiness.length}건</span>
                        </div>

                        {pendingBusiness.length === 0 ? (
                            <div className="p-20 text-center text-foreground-muted bg-surface">
                                <div className="text-5xl mb-6">✨</div>
                                <p className="text-lg font-medium">대기 중인 기업 인증 요청이 없습니다.</p>
                                <p className="text-sm mt-1">모든 검토가 완료되었습니다.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {pendingBusiness.map((business) => (
                                    <div key={business.id} className="p-6 md:p-8 flex items-center justify-between hover:bg-surface-hover transition-all bg-surface">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-3xl shadow-inner">
                                                🏢
                                            </div>
                                            <div>
                                                <div className="font-bold text-foreground text-lg mb-0.5">{business.companyName || 'Unknown'}</div>
                                                <div className="text-sm text-foreground-muted mb-3">{business.user?.email || '-'}</div>
                                                <div className="flex items-center gap-3">
                                                    {business.registrationNum && (
                                                        <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold text-foreground-muted border border-slate-200 dark:border-slate-700">
                                                            사업자번호: {business.registrationNum}
                                                        </span>
                                                    )}
                                                    {business.registrationFile && (
                                                        <a
                                                            href={business.registrationFile.startsWith('http') ? business.registrationFile : `${API_BASE_URL}${business.registrationFile}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-primary text-xs font-bold hover:underline flex items-center gap-1 bg-primary/5 px-3 py-1.5 rounded-xl"
                                                        >
                                                            사업자등록증 보기 ↗
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleBusinessVerify(business.id, true)}
                                                className="px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all active:scale-95"
                                            >
                                                승인하기
                                            </button>
                                            <button
                                                onClick={() => handleBusinessVerify(business.id, false)}
                                                className="px-6 py-3 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded-xl text-sm font-bold hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all active:scale-95"
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
