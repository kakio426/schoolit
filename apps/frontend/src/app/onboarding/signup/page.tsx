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
        if (!formData.name || !formData.phone || !token) {
            alert('모든 필수 정보를 입력해 주세요.');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/social/finish-signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    role,
                    name: formData.name,
                    phone: formData.phone,
                }),
            });

            if (response.ok) {
                await refreshProfile();
                if (role === 'SCHOOL') {
                    router.push('/onboarding/email-verify');
                } else {
                    router.push('/dashboard');
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                alert(`가입 처리 중 오류가 발생했습니다: ${errorData.message || response.statusText}`);
            }
        } catch (error: any) {
            console.error('Failed to finish signup:', error);
            alert(`네트워크 오류가 발생했습니다: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-background py-20 px-4">
            <div className="max-w-md mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-foreground">회원가입 완료하기</h1>
                    <p className="text-foreground-muted mt-2">소셜 계정 정보를 확인하고 가입을 마쳐주세요.</p>
                </div>

                <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-500">이름 (실명)</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            placeholder="이름을 입력하세요"
                        />
                    </div>

                    {/* Email (Readonly) */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-500">이메일</label>
                        <input
                            type="email"
                            value={formData.email}
                            readOnly
                            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 outline-none cursor-not-allowed"
                        />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-500">휴대폰 번호</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            placeholder="01012345678"
                        />
                        <p className="text-xs text-slate-400">
                            소셜 계정에 등록된 번호를 자동으로 가져옵니다. 틀린 경우 수정해 주세요.
                        </p>
                    </div>

                    {/* Finish Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full h-14 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 active:scale-[0.98] disabled:opacity-30 transition-all mt-4 shadow-lg shadow-slate-200"
                    >
                        {isSubmitting ? '처리 중...' : '가입 완료하기'}
                    </button>

                    <p className="text-xs text-center text-slate-400">
                        '가입 완료하기'를 누르면 이용약관 및 개인정보 처리방침에 동의하는 것으로 간주됩니다.
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
