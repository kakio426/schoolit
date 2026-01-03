"use client";

import DashboardLayout from '@/components/layout/DashboardLayout';

export default function DashboardPage() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-surface p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
                        <h3 className="text-foreground-muted text-sm font-medium">진행 중인 매칭</h3>
                        <p className="text-3xl font-bold mt-2 text-primary">12</p>
                    </div>
                    <div className="bg-surface p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
                        <h3 className="text-foreground-muted text-sm font-medium">새로운 메시지</h3>
                        <p className="text-3xl font-bold mt-2 text-primary">4</p>
                    </div>
                    <div className="bg-surface p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700 shadow-sm transition-all hover:shadow-md sm:col-span-2 lg:col-span-1">
                        <h3 className="text-foreground-muted text-sm font-medium">평점</h3>
                        <p className="text-3xl font-bold mt-2 text-primary">4.9</p>
                    </div>
                </div>

                <div className="bg-surface p-8 rounded-3xl border border-slate-200/50 dark:border-slate-700 shadow-sm min-h-[400px]">
                    <h2 className="text-xl font-bold mb-6 text-foreground">최근 활동</h2>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4 p-4 hover:bg-surface-hover rounded-2xl transition-colors border border-transparent hover:border-slate-100/50">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-xl">
                                    {i === 1 ? '📋' : i === 2 ? '💬' : '🤝'}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-foreground">
                                        {i === 1 ? '서울대학교 병설 유치원 공고' : i === 2 ? '지원자 김철수님의 메시지' : '매칭이 성사되었습니다'}
                                    </h4>
                                    <p className="text-sm text-foreground-muted">{i}시간 전</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
