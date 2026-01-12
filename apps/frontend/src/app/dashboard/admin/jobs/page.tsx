"use client";

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { AdminJobsTable } from '@/components/admin/AdminJobsTable';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminJobsPage() {
    const { user, isLoading } = useAuth();

    if (isLoading) return <div className="p-10 text-center text-foreground">로딩 중...</div>;

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
            <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">공고 관리</h1>
                    <p className="text-foreground-muted">플랫폼의 모든 채용 및 행사 공고를 모니터링하고 관리합니다.</p>
                </div>

                <div className="bg-surface rounded-3xl border border-slate-200/50 dark:border-slate-700 shadow-sm p-6 md:p-8">
                    <AdminJobsTable />
                </div>
            </div>
        </DashboardLayout>
    );
}
