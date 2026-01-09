"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function VerificationPendingView() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const isEmailVerified = !!user?.schoolProfile?.schoolName;

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-in fade-in zoom-in duration-500">
            <div className={`w-24 h-24 ${isEmailVerified ? 'bg-amber-500/10 ring-amber-500/5' : 'bg-blue-500/10 ring-blue-500/5'} rounded-full flex items-center justify-center mb-4 ring-8`}>
                <span className="text-5xl">{isEmailVerified ? '⏳' : '🛡️'}</span>
            </div>

            <div className="space-y-4 max-w-lg">
                <h1 className="text-3xl font-bold text-foreground">
                    {isEmailVerified ? '관리자 승인 대기 중입니다' : '학교 인증이 필요합니다'}
                </h1>
                <p className="text-lg text-foreground-muted leading-relaxed">
                    {isEmailVerified ? (
                        <>
                            이메일 인증이 완료되었습니다.<br />
                            <strong className="text-foreground">안전한 교육 환경</strong>을 위해 담당자가<br />
                            <span className="text-primary underline decoration-2 underline-offset-4">해당 학교 행정실로 직접 전화</span>를 드려<br />
                            선생님의 재직 여부를 최종 확인하고 있습니다.
                        </>
                    ) : (
                        <>
                            아직 학교 이메일 인증을 완료하지 않았습니다.<br />
                            <strong className="text-foreground">korea.kr</strong> 또는 <strong className="text-foreground">go.kr</strong> 등의<br />
                            공직자 통합 메일로 본인 인증을 진행해 주세요.
                        </>
                    )}
                </p>
            </div>

            {isEmailVerified ? (
                <div className="bg-surface border border-border p-6 rounded-2xl max-w-md w-full shadow-sm text-left">
                    <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                        <span className="text-xl">📞</span> 확인 절차 안내
                    </h3>
                    <ol className="space-y-3 text-sm text-foreground-muted list-decimal list-inside">
                        <li>입력하신 이메일의 학교/기관 정보를 확인합니다.</li>
                        <li>해당 기관의 <strong>공식 대표 번호</strong>로 전화를 겁니다.</li>
                        <li>가입하신 선생님의 재직 여부를 행정실에 문의합니다.</li>
                        <li>확인이 완료되면 즉시 모든 기능을 이용하실 수 있습니다.</li>
                    </ol>
                </div>
            ) : (
                <div className="pt-4 flex flex-col gap-4 w-full max-w-xs">
                    <button
                        onClick={() => router.push('/onboarding/email-verify')}
                        className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary-hover active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                    >
                        이메일 인증하러 가기
                    </button>
                </div>
            )}

            <div className="pt-4 flex items-center gap-4">
                {isEmailVerified && (
                    <button
                        onClick={() => router.push('/onboarding/email-verify')}
                        className="text-sm text-foreground-muted hover:text-primary transition-colors underline underline-offset-4"
                    >
                        이메일 다시 인증하기
                    </button>
                )}
                <button
                    onClick={logout}
                    className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-foreground-muted hover:text-foreground hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium"
                >
                    로그아웃
                </button>
            </div>
        </div>
    );
}
