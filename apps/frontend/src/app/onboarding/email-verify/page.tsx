"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function EmailVerificationPage() {
    const router = useRouter();
    const { user, refreshProfile } = useAuth();

    // Steps: 'INPUT_EMAIL' -> 'INPUT_CODE'
    const [step, setStep] = useState<'INPUT_EMAIL' | 'INPUT_CODE'>('INPUT_EMAIL');
    const [email, setEmail] = useState('');
    const [schoolName, setSchoolName] = useState('');
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();

        // Client-side validation for official domains
        const allowedDomains = ['korea.kr', 'go.kr', 'sen.go.kr'];
        const domain = email.split('@')[1];
        const isAllowed = allowedDomains.some((d) => domain?.endsWith(d));

        if (!isAllowed) {
            setError('공직자 통합 메일(@korea.kr, @go.kr)만 사용 가능합니다.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await api.post('/auth/email/request', { email });
            setStep('INPUT_CODE');
        } catch (err: any) {
            setError(err.message || '인증 코드를 전송하는데 실패했습니다. 이메일을 확인해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await api.post<{ success: boolean; accessToken?: string }>('/auth/email/verify', {
                code,
                schoolName,
            });
            if (res.success) {
                // Success! Update token and refresh profile
                if (res.accessToken) {
                    localStorage.setItem('accessToken', res.accessToken);
                }
                await refreshProfile();
                router.push('/dashboard');
            } else {
                setError('인증 코드가 올바르지 않거나 만료되었습니다.');
            }
        } catch (err: any) {
            setError(err.message || '인증 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
            <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">
                        🛡️
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        학교/기관 인증
                    </h1>
                    <p className="text-foreground-muted">
                        보안을 위해 <strong>korea.kr</strong> 또는 <strong>go.kr</strong> 등의<br />
                        공직자/기관 공식 이메일로 본인을 인증해주세요.
                    </p>
                </div>

                <div className="bg-surface border border-border p-8 rounded-[32px] shadow-sm">
                    {step === 'INPUT_EMAIL' ? (
                        <form onSubmit={handleSendCode} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground ml-1">학교/기관명</label>
                                <input
                                    type="text"
                                    placeholder="예: 서울초등학교"
                                    value={schoolName}
                                    onChange={(e) => setSchoolName(e.target.value)}
                                    className="w-full h-14 px-5 rounded-2xl bg-input-bg border border-input-border text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    required
                                />
                            </div>
                            <div className="pt-2 border-t border-border/50"></div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground ml-1">공직자 통합 메일</label>
                                <input
                                    type="email"
                                    placeholder="example@korea.kr"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-14 px-5 rounded-2xl bg-input-bg border border-input-border text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    required
                                />
                                <p className="text-xs text-foreground-muted ml-1">
                                    * 개인(네이버, 카카오 등) 이메일은 사용할 수 없습니다.
                                </p>
                            </div>

                            {error && (
                                <p className="text-sm text-red-500 font-medium text-center bg-red-500/10 p-3 rounded-xl">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-14 bg-primary text-white font-bold rounded-2xl hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-50"
                            >
                                {isLoading ? "전송 중..." : "인증코드 받기"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyCode} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground ml-1">인증코드 입력</label>
                                <input
                                    type="text"
                                    placeholder="000000"
                                    maxLength={6}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                                    className="w-full h-14 px-5 rounded-2xl bg-input-bg border border-input-border text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-center text-2xl tracking-widest font-mono"
                                    required
                                    autoFocus
                                />
                                <p className="text-xs text-center text-foreground-muted">
                                    <strong>{email}</strong>으로 발송된<br />6자리 코드를 입력해주세요.
                                </p>
                            </div>

                            {error && (
                                <p className="text-sm text-red-500 font-medium text-center bg-red-500/10 p-3 rounded-xl">
                                    {error}
                                </p>
                            )}

                            <div className="flex flex-col gap-3">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-14 bg-primary text-white font-bold rounded-2xl hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-50"
                                >
                                    {isLoading ? "확인 중..." : "인증하기"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep('INPUT_EMAIL')}
                                    className="text-sm text-foreground-muted hover:text-foreground underline decoration-border"
                                >
                                    이메일 다시 입력하기
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </main>
    );
}
