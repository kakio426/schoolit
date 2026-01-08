"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ReviewListModal from '@/components/admin/ReviewListModal';
import { api } from '@/lib/api';

interface User {
    id: number;
    email: string;
    name: string;
    role: string;
    provider: string;
    createdAt: string;
    phone?: string;
    schoolProfile?: { schoolName: string };
    businessProfile?: { companyName: string };
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [reviewTarget, setReviewTarget] = useState<{ id: number; name: string } | null>(null);

    const loadUsers = async () => {
        try {
            const data = await api.get<User[]>('/users/admin/all-users');
            setUsers(data);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleResetUser = async (userId: number, userName: string) => {
        if (!confirm(`정말로 "${userName}" 계정을 초기화하시겠습니까?\n\n역할이 PENDING으로 변경되고 모든 프로필이 삭제됩니다.`)) {
            return;
        }

        try {
            await api.post(`/users/admin/reset-user/${userId}`);
            alert('계정이 초기화되었습니다.');
            loadUsers(); // Reload list
        } catch (error: any) {
            alert(`초기화 실패: ${error.message || '알 수 없는 오류'}`);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">사용자 관리</h1>
                        <p className="text-foreground-muted">모든 사용자 계정을 확인하고 관리합니다.</p>
                    </div>
                    <button
                        onClick={loadUsers}
                        className="px-4 py-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-all font-semibold"
                    >
                        🔄 새로고침
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="bg-surface border border-border rounded-[32px] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1200px]">
                                <thead className="bg-background/50">
                                    <tr className="border-b border-border">
                                        <th className="px-6 py-4 text-left text-sm font-bold text-foreground whitespace-nowrap">ID</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-foreground whitespace-nowrap">이메일</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-foreground whitespace-nowrap">이름</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-foreground whitespace-nowrap">연락처</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-foreground whitespace-nowrap">소속</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-foreground whitespace-nowrap">역할</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-foreground whitespace-nowrap">가입 방법</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-foreground whitespace-nowrap">가입일</th>
                                        <th className="px-6 py-4 text-center text-sm font-bold text-foreground whitespace-nowrap">작업</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-b border-border hover:bg-background/30 transition-colors">
                                            <td className="px-6 py-4 text-sm text-foreground font-mono whitespace-nowrap">{user.id}</td>
                                            <td className="px-6 py-4 text-sm text-foreground">{user.email}</td>
                                            <td className="px-6 py-4 text-sm text-foreground font-semibold whitespace-nowrap">{user.name}</td>
                                            <td className="px-6 py-4 text-sm text-foreground-muted whitespace-nowrap">{user.phone || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">
                                                {user.role === 'SCHOOL' ? user.schoolProfile?.schoolName :
                                                    user.role === 'BUSINESS' ? user.businessProfile?.companyName :
                                                        '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-600' :
                                                    user.role === 'SCHOOL' ? 'bg-blue-500/20 text-blue-600' :
                                                        user.role === 'TEACHER' ? 'bg-green-500/20 text-green-600' :
                                                            user.role === 'BUSINESS' ? 'bg-orange-500/20 text-orange-600' :
                                                                'bg-slate-500/20 text-slate-600'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-foreground-muted whitespace-nowrap">{user.provider || 'EMAIL'}</td>
                                            <td className="px-6 py-4 text-sm text-foreground-muted whitespace-nowrap">
                                                {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                                            </td>
                                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-2">
                                                    {(user.role === 'TEACHER' || user.role === 'BUSINESS') && (
                                                        <button
                                                            onClick={() => setReviewTarget({ id: user.id, name: user.name })}
                                                            className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200 transition-all text-xs font-bold"
                                                        >
                                                            ⭐ 후기
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleResetUser(user.id, user.name)}
                                                        className="px-3 py-1.5 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all text-xs font-bold"
                                                    >
                                                        초기화
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Review Modal */}
            {reviewTarget && (
                <ReviewListModal
                    userId={reviewTarget.id}
                    userName={reviewTarget.name}
                    onClose={() => setReviewTarget(null)}
                />
            )}
        </DashboardLayout>
    );
}
