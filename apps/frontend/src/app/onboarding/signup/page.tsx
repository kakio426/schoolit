"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function SignupOnboardingPage() {
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
                alert('가입 처리 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('Failed to finish signup:', error);
            alert('네트워크 오류가 발생했습니다.');
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

                <div className="bg-white p-8 rounded-3xl border border-background-muted shadow-sm space-y-6">
                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground-muted">이름 (실명)</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full h-12 px-4 rounded-xl border border-background-muted focus:border-primary outline-none transition-all"
                            placeholder="이름을 입력하세요"
                        />
                    </div>

                    {/* Email (Readonly) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground-muted">이메일</label>
                        <input
                            type="email"
                            value={formData.email}
                            readOnly
                            className="w-full h-12 px-4 rounded-xl border border-background-muted bg-background-muted/10 text-foreground-muted outline-none cursor-not-allowed"
                        />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground-muted">휴대폰 번호</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full h-12 px-4 rounded-xl border border-background-muted focus:border-primary outline-none transition-all"
                            placeholder="01012345678"
                        />
                        <p className="text-xs text-foreground-muted">
                            소셜 계정에 등록된 번호를 자동으로 가져옵니다. 틀린 경우 수정해 주세요.
                        </p>
                    </div>

                    {/* Finish Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full h-14 bg-foreground text-white rounded-2xl font-bold text-lg hover:bg-foreground/90 disabled:opacity-30 transition-all mt-4"
                    >
                        {isSubmitting ? '처리 중...' : '가입 완료하기'}
                    </button>

                    <p className="text-xs text-center text-foreground-muted">
                        '가입 완료하기'를 누르면 이용약관 및 개인정보 처리방침에 동의하는 것으로 간주됩니다.
                    </p>
                </div>
            </div>
        </main>
    );
}
