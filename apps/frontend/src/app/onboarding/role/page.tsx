"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function RoleSelectionPage() {
    const [selectedRole, setSelectedRole] = useState<'TEACHER' | 'SCHOOL' | 'BUSINESS' | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { token } = useAuth();
    const router = useRouter();

    const handleComplete = async () => {
        if (!selectedRole || !token) return;

        setIsSubmitting(true);
        try {
            await api.put('/users/role', { role: selectedRole });
            router.push(`/onboarding/signup?role=${selectedRole}`);
        } catch (error: any) {
            console.error('Failed to update role:', error);
            alert(`역할 선택 중 오류가 발생했습니다: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
            <div className="w-full max-w-4xl space-y-12 animate-in fade-in zoom-in duration-500">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">
                        하나의 계정, 세 가지 시작
                    </h1>
                    <p className="text-xl text-foreground-muted">
                        School It에서 당신의 역할을 선택해 주세요.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Teacher Card */}
                    <button
                        onClick={() => setSelectedRole('TEACHER')}
                        className={`group relative p-8 rounded-[32px] border-2 transition-all duration-300 text-left hover:shadow-2xl ${selectedRole === 'TEACHER'
                            ? 'border-primary bg-primary/5 ring-4 ring-primary/10'
                            : 'border-border bg-surface hover:border-primary/50'
                            }`}
                    >
                        <div className="space-y-6">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                                👨‍🏫
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-foreground">프리랜서 강사</h3>
                                <p className="text-sm text-foreground-muted leading-relaxed">
                                    방과후 학교, 돌봄 교실 등<br />나의 재능을 펼칠 곳을 찾습니다.
                                </p>
                            </div>
                        </div>
                        {selectedRole === 'TEACHER' && (
                            <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs">
                                ✓
                            </div>
                        )}
                    </button>

                    {/* School Card */}
                    <button
                        onClick={() => setSelectedRole('SCHOOL')}
                        className={`group relative p-8 rounded-[32px] border-2 transition-all duration-300 text-left hover:shadow-2xl ${selectedRole === 'SCHOOL'
                            ? 'border-primary bg-primary/5 ring-4 ring-primary/10'
                            : 'border-border bg-surface hover:border-primary/50'
                            }`}
                    >
                        <div className="space-y-6">
                            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                                🏫
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-foreground">학교/기관 담당자</h3>
                                <p className="text-sm text-foreground-muted leading-relaxed">
                                    위변조 방지 2단계 인증을 거쳐<br />검증된 강사를 채용합니다.
                                </p>
                            </div>
                        </div>
                        {selectedRole === 'SCHOOL' && (
                            <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs">
                                ✓
                            </div>
                        )}
                    </button>

                    {/* Business Card */}
                    <button
                        onClick={() => setSelectedRole('BUSINESS')}
                        className={`group relative p-8 rounded-[32px] border-2 transition-all duration-300 text-left hover:shadow-2xl ${selectedRole === 'BUSINESS'
                            ? 'border-primary bg-primary/5 ring-4 ring-primary/10'
                            : 'border-border bg-surface hover:border-primary/50'
                            }`}
                    >
                        <div className="space-y-6">
                            <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                                🏢
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-foreground">교육 위탁 업체</h3>
                                <p className="text-sm text-foreground-muted leading-relaxed">
                                    방과후/돌봄 위탁 운영 및<br />교육 행사 전문 기업입니다.
                                </p>
                            </div>
                        </div>
                        {selectedRole === 'BUSINESS' && (
                            <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs">
                                ✓
                            </div>
                        )}
                    </button>
                </div>

                <div className="flex flex-col items-center space-y-6 pt-4">
                    <button
                        onClick={handleComplete}
                        disabled={!selectedRole || isSubmitting}
                        className="w-full max-w-sm h-16 bg-primary text-white rounded-2xl font-bold text-xl shadow-lg shadow-primary/20 hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 transition-all"
                    >
                        {isSubmitting ? '처리 중...' : (selectedRole === 'SCHOOL' ? '인증하고 시작하기' : '시작하기')}
                    </button>
                    <p className="text-sm text-foreground-muted">
                        역할은 나중에 프로필 설정에서 추가할 수 있습니다.
                    </p>
                </div>
            </div>
        </main>
    );
}
