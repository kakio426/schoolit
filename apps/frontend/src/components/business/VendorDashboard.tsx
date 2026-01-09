'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { JobApplication, JobListing } from '@/types';
import Link from 'next/link';
import {
    Briefcase, Clock, CheckCircle, XCircle, FileText,
    TrendingUp, Award, AlertCircle, ChevronRight, Building
} from 'lucide-react';
import StandardCard, { StandardBadge } from '@/components/ui/StandardCard';

interface ApplicationWithJob extends JobApplication {
    job: JobListing;
}

interface VendorStats {
    totalBids: number;
    activeBids: number;
    wonBids: number;
    totalRevenue: number;
}

interface VendorDashboardProps {
    applications: ApplicationWithJob[];
    stats?: VendorStats;
}

export default function VendorDashboard({ applications, stats }: VendorDashboardProps) {
    // Derive stats if not provided
    const derivedStats: VendorStats = stats || {
        totalBids: applications.length,
        activeBids: applications.filter(a => ['PENDING', 'BIDDING'].includes(a.status)).length,
        wonBids: applications.filter(a => ['CONTRACTING', 'EXECUTING', 'PAYMENT_COMPLETED', 'HIRED'].includes(a.status)).length,
        totalRevenue: applications
            .filter(a => ['PAYMENT_COMPLETED'].includes(a.status))
            .reduce((sum, a) => sum + ((a as any).cost || 0), 0),
    };

    // Group applications by status
    const activeBids = applications.filter(a => ['PENDING', 'BIDDING'].includes(a.status));
    const inProgress = applications.filter(a => ['CONTRACTING', 'EXECUTING'].includes(a.status));
    const completed = applications.filter(a => a.status === 'PAYMENT_COMPLETED');
    const rejected = applications.filter(a => a.status === 'REJECTED');

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <StandardBadge variant="warning">견적 검토중</StandardBadge>;
            case 'BIDDING':
                return <StandardBadge variant="indigo">업체 선정중</StandardBadge>;
            case 'CONTRACTING':
                return <StandardBadge variant="primary">계약 진행중</StandardBadge>;
            case 'EXECUTING':
                return <StandardBadge variant="info">과업 수행중</StandardBadge>;
            case 'PAYMENT_COMPLETED':
                return <StandardBadge variant="success">완료</StandardBadge>;
            case 'REJECTED':
                return <StandardBadge variant="error">미선정</StandardBadge>;
            default:
                return <StandardBadge variant="default">{status}</StandardBadge>;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-surface rounded-2xl border border-border p-5 space-y-2">
                    <div className="flex items-center gap-2 text-foreground-muted text-sm font-bold">
                        <Briefcase className="w-4 h-4" /> 총 입찰
                    </div>
                    <div className="text-3xl font-black text-foreground">{derivedStats.totalBids}</div>
                </div>
                <div className="bg-surface rounded-2xl border border-border p-5 space-y-2">
                    <div className="flex items-center gap-2 text-amber-500 text-sm font-bold">
                        <Clock className="w-4 h-4" /> 진행중
                    </div>
                    <div className="text-3xl font-black text-amber-500">{derivedStats.activeBids}</div>
                </div>
                <div className="bg-surface rounded-2xl border border-border p-5 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-500 text-sm font-bold">
                        <Award className="w-4 h-4" /> 낙찰
                    </div>
                    <div className="text-3xl font-black text-emerald-500">{derivedStats.wonBids}</div>
                </div>
                <div className="bg-surface rounded-2xl border border-border p-5 space-y-2">
                    <div className="flex items-center gap-2 text-primary text-sm font-bold">
                        <TrendingUp className="w-4 h-4" /> 누적 수익
                    </div>
                    <div className="text-2xl font-black text-primary">
                        {derivedStats.totalRevenue.toLocaleString()}원
                    </div>
                </div>
            </div>

            {/* Active Bids Section */}
            {activeBids.length > 0 && (
                <StandardCard
                    title="진행 중인 입찰"
                    icon={<Clock className="w-5 h-5 text-amber-500" />}
                    extra={<span className="text-sm font-bold text-foreground-muted">{activeBids.length}건</span>}
                >
                    <div className="space-y-3">
                        {activeBids.map(app => (
                            <Link
                                key={app.id}
                                href={`/dashboard/jobs/${app.jobId}`}
                                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                                        <Building className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">
                                            {app.job?.title || '공고 정보 없음'}
                                        </h4>
                                        <p className="text-xs text-foreground-muted">
                                            제안가: {((app as any).cost || 0).toLocaleString()}원
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {getStatusBadge(app.status)}
                                    <ChevronRight className="w-4 h-4 text-foreground-muted group-hover:text-primary transition-colors" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </StandardCard>
            )}

            {/* In Progress Section */}
            {inProgress.length > 0 && (
                <StandardCard
                    title="진행 중인 계약"
                    icon={<FileText className="w-5 h-5 text-primary" />}
                    extra={<span className="text-sm font-bold text-foreground-muted">{inProgress.length}건</span>}
                >
                    <div className="space-y-3">
                        {inProgress.map(app => (
                            <Link
                                key={app.id}
                                href={`/dashboard/contracts/${app.id}`}
                                className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-xl hover:bg-primary/10 transition-colors group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">
                                            {app.job?.title || '계약 정보'}
                                        </h4>
                                        <p className="text-xs text-foreground-muted">
                                            계약 금액: {((app as any).cost || 0).toLocaleString()}원
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {getStatusBadge(app.status)}
                                    <ChevronRight className="w-4 h-4 text-foreground-muted group-hover:text-primary transition-colors" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </StandardCard>
            )}

            {/* Completed Section */}
            {completed.length > 0 && (
                <StandardCard
                    title="완료된 계약"
                    icon={<Award className="w-5 h-5 text-emerald-500" />}
                    extra={<span className="text-sm font-bold text-emerald-500">{completed.length}건 완료</span>}
                >
                    <div className="space-y-3">
                        {completed.slice(0, 5).map(app => (
                            <div
                                key={app.id}
                                className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-foreground">{app.job?.title || '완료된 계약'}</h4>
                                        <p className="text-xs text-emerald-600">
                                            {((app as any).cost || 0).toLocaleString()}원 정산 완료
                                        </p>
                                    </div>
                                </div>
                                {getStatusBadge(app.status)}
                            </div>
                        ))}
                    </div>
                </StandardCard>
            )}

            {/* Empty State */}
            {applications.length === 0 && (
                <div className="text-center py-16 bg-surface rounded-3xl border border-border">
                    <Briefcase className="w-16 h-16 text-foreground-muted mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-foreground mb-2">아직 입찰 내역이 없습니다</h3>
                    <p className="text-foreground-muted mb-6">학교 행사 공고에 견적을 제출해보세요!</p>
                    <Link
                        href="/dashboard/jobs"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
                    >
                        공고 둘러보기 <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            )}
        </div>
    );
}
