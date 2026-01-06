"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function SignupOnboardingContent() {
    const { user, token, refreshProfile } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
            });
        }
    }, [user]);

    const handleSubmit = async () => {
        if (!formData.name || !formData.phone) {
            alert('모든 필수 정보를 입력해 주세요.');
            return;
        }

        setIsSubmitting(true);
        try {
            // Using the api helper for consistency and automatic token handling
            const response = await api.post<{ success: boolean }>('/auth/social/finish-signup', {
                role,
                name: formData.name,
                phone: formData.phone,
            });

            await refreshProfile();
            if (role === 'SCHOOL') {
                router.push('/onboarding/email-verify');
            } else {
                router.push('/dashboard');
            }
        } catch (error: any) {
            console.error('Failed to finish signup:', error);
            alert(`가입 처리 중 오류가 발생했습니다: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-background py-20 px-4">
            <div className="max-w-md mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">
                        ✨
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">회원가입 완료하기</h1>
                    <p className="text-foreground-muted">소셜 계정 정보를 확인하고 가입을 마쳐주세요.</p>
                </div>

                <div className="bg-surface border border-border p-8 rounded-[32px] shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground ml-1">이름 (실명)</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full h-14 px-5 rounded-2xl bg-input-bg border border-input-border text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            placeholder="이름을 입력하세요"
                        />
                    </div>

                    {/* Email (Readonly) */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground ml-1">이메일</label>
                        <input
                            type="email"
                            value={formData.email}
                            readOnly
                            className="w-full h-14 px-5 rounded-2xl bg-input-bg border border-input-border text-foreground-muted opacity-60 outline-none cursor-not-allowed"
                        />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground ml-1">휴대폰 번호</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full h-14 px-5 rounded-2xl bg-input-bg border border-input-border text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            placeholder="01012345678"
                        />
                        <p className="text-xs text-foreground-muted ml-1">
                            소셜 계정에 등록된 번호를 자동으로 가져옵니다. 틀린 경우 수정해 주세요.
                        </p>
                    </div>

                    {/* Finish Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary-hover active:scale-[0.98] disabled:opacity-30 transition-all mt-4 shadow-lg shadow-primary/20"
                    >
                        {isSubmitting ? '처리 중...' : '가입 완료하기'}
                    </button>

                    <p className="text-[11px] text-center text-foreground-muted leading-relaxed">
                        '가입 완료하기'를 누르면 <span className="underline decoration-border">이용약관</span> 및 <span className="underline decoration-border">개인정보 처리방침</span>에 동의하는 것으로 간주됩니다.
                    </p>
                </div>
            </div>
        </main>
    );
}

export default function SignupOnboardingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex text-lg font-bold items-center justify-center">Loading...</div>}>
            <SignupOnboardingContent />
        </Suspense>
    );
}
