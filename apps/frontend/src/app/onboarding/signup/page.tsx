"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import TermsAgreement from '@/components/auth/TermsAgreement';

function SignupOnboardingContent() {
    const { user, token, refreshProfile } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        legalAgreed: false,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // 🔍 Phase 1: Component mount 시 role 파라미터 로깅
    useEffect(() => {
        console.log('[Signup] Component mounted');
        console.log('[Signup] URL role parameter:', role);
        console.log('[Signup] User:', user);
    }, [role, user]);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                legalAgreed: false,
            });
        }
    }, [user]);

    const handleSubmit = async () => {
        if (!formData.name || !formData.phone) {
            alert('모든 필수 정보를 입력해 주세요.');
            return;
        }

        if (!formData.legalAgreed) {
            alert('약관에 동의해 주세요.');
            return;
        }

        // 🔍 Phase 1: role 파라미터 검증 및 상세 로깅
        if (!role) {
            console.error('[Signup] Role parameter is missing!');
            alert('역할 정보가 없습니다. 다시 시도해 주세요.');
            router.push('/onboarding/role');
            return;
        }

        console.log('[Signup] Starting signup process');
        console.log('[Signup] Role value:', role);
        console.log('[Signup] Role type:', typeof role);
        console.log('[Signup] Is SCHOOL?', role === 'SCHOOL');
        console.log('[Signup] Form data:', { name: formData.name, phone: formData.phone });

        setIsSubmitting(true);
        try {
            console.log('[Signup] Submitting to API with role:', role);

            // Using the api helper for consistency and automatic token handling
            const response = await api.post<{ accessToken: string }>('/auth/social/finish-signup', {
                role,
                name: formData.name,
                phone: formData.phone,
            });

            console.log('[Signup] API Response received:', response);
            console.log('[Signup] Response has accessToken?', !!response.accessToken);

            // 🔑 새로운 토큰 저장 (역할이 업데이트되었으므로)
            if (response.accessToken) {
                localStorage.setItem('token', response.accessToken);
                console.log('[Signup] New token saved to localStorage');
            } else {
                console.warn('[Signup] No accessToken in response!');
            }

            // 프로필 새로고침
            console.log('[Signup] Calling refreshProfile...');
            await refreshProfile();
            console.log('[Signup] Profile refreshed successfully');

            // 🔍 Phase 1: 리다이렉트 전 상세 로그
            console.log('[Signup] Preparing redirect...');
            console.log('[Signup] Current role value:', role);
            console.log('[Signup] Checking redirect condition: role === "SCHOOL":', role === 'SCHOOL');

            // 🔧 Phase 2: 강제 페이지 이동 (router.push가 작동하지 않는 문제 해결)
            if (role === 'SCHOOL') {
                console.log('[Signup] ✅ Condition matched: Redirecting to email verification');
                console.log('[Signup] Using window.location.href for navigation');
                window.location.href = '/onboarding/email-verify';
            } else {
                console.log('[Signup] ✅ Condition not matched: Redirecting to dashboard');
                console.log('[Signup] Using window.location.href for navigation');
                window.location.href = '/dashboard';
            }
        } catch (error: any) {
            // 🔍 Phase 1: 에러 상세 정보 로깅
            console.error('[Signup] ❌ Error occurred during signup');
            console.error('[Signup] Error type:', error.constructor.name);
            console.error('[Signup] Error message:', error.message);
            console.error('[Signup] Error response:', error.response);
            console.error('[Signup] Full error object:', error);
            console.error('[Signup] Error stack:', error.stack);

            const errorMessage = error.response?.data?.message || error.message || '알 수 없는 오류';
            alert(`가입 처리 중 오류가 발생했습니다:\n${errorMessage}\n\n자세한 내용은 콘솔을 확인해 주세요.`);
        } finally {
            setIsSubmitting(false);
            console.log('[Signup] Signup process completed');
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

                    {/* Company Name (Business Only) */}
                    {role === 'BUSINESS' && (
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground ml-1">업체명 (Company Name)</label>
                            <input
                                type="text"
                                value={formData.companyName}
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                className="w-full h-14 px-5 rounded-2xl bg-input-bg border border-input-border text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="사업자등록증 상의 업체명을 입력하세요"
                            />
                        </div>
                    )}

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

                    {/* Legal Dictionary Agreement Component */}
                    <div className="pt-2">
                        <TermsAgreement onAgreementChange={(agreed) => setFormData(prev => ({ ...prev, legalAgreed: agreed }))} />
                    </div>

                    {/* Finish Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !formData.legalAgreed}
                        className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary-hover active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20"
                    >
                        {isSubmitting ? '처리 중...' : '가입 완료하기'}
                    </button>

                    <p className="text-[11px] text-center text-foreground-muted leading-relaxed">
                        '가입 완료하기'를 누르면 상기 약관에 모두 동의한 것으로 간주됩니다.
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
