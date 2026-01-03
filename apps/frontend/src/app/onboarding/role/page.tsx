"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function RoleSelectionPage() {
    const [selectedRole, setSelectedRole] = useState<'TEACHER' | 'SCHOOL' | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { refreshProfile, token } = useAuth();
    const router = useRouter();

    const handleComplete = async () => {
        if (!selectedRole || !token) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/users/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ role: selectedRole }),
            });

            if (response.ok) {
                await refreshProfile();
                router.push('/dashboard');
            } else {
                alert('역할 설정 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('Failed to update role:', error);
            alert('네트워크 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
            <div className="w-full max-w-2xl space-y-12">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">
                        하나의 계정, 두 가지 시작
                    </h1>
                    <p className="text-xl text-foreground-muted">
                        School It에서 당신의 역할을 선택해 주세요.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Teacher Card */}
                    <button
                        onClick={() => setSelectedRole('TEACHER')}
                        className={`group relative p-8 rounded-3xl border-2 transition-all duration-300 text-left hover:shadow-xl ${selectedRole === 'TEACHER'
                                ? 'border-primary bg-primary/5 ring-4 ring-primary/10'
                                : 'border-background-muted bg-white hover:border-primary/50'
                            }`}
                    >
                        <div className="space-y-6">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                                👨‍🏫
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-foreground mb-2">프리랜서 강사</h3>
                                <p className="text-foreground-muted">
                                    방과후 학교, 돌봄 교실 등<br />나의 재능을 펼칠 학교를 찾습니다.
                                </p>
                            </div>
                        </div>
                    </button>

                    {/* School Card */}
                    <button
                        onClick={() => setSelectedRole('SCHOOL')}
                        className={`group relative p-8 rounded-3xl border-2 transition-all duration-300 text-left hover:shadow-xl ${selectedRole === 'SCHOOL'
                                ? 'border-primary bg-primary/5 ring-4 ring-primary/10'
                                : 'border-background-muted bg-white hover:border-primary/50'
                            }`}
                    >
                        <div className="space-y-6">
                            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                                🏫
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-foreground mb-2">학교/기관 담당자</h3>
                                <p className="text-foreground-muted">
                                    우리 학교에 꼭 필요한<br />최고의 강사님을 매칭받습니다.
                                </p>
                            </div>
                        </div>
                    </button>
                </div>

                <div className="flex flex-col items-center space-y-4">
                    <button
                        onClick={handleComplete}
                        disabled={!selectedRole || isSubmitting}
                        className="w-full max-w-xs h-16 bg-primary text-white rounded-2xl font-bold text-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 transition-all"
                    >
                        {isSubmitting ? '처리 중...' : '시작하기'}
                    </button>
                    <p className="text-sm text-foreground-muted">
                        역할은 나중에 프로필 설정에서 추가할 수 있습니다.
                    </p>
                </div>
            </div>
        </main>
    );
}
