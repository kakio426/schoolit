"use client";

import { useAuth } from '@/contexts/AuthContext';

export default function VerificationPendingView() {
    const { logout } = useAuth();

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mb-4 ring-8 ring-amber-500/5">
                <span className="text-5xl">⏳</span>
            </div>

            <div className="space-y-4 max-w-lg">
                <h1 className="text-3xl font-bold text-foreground">
                    관리자 승인 대기 중입니다
                </h1>
                <p className="text-lg text-foreground-muted leading-relaxed">
                    이메일 인증이 완료되었습니다.<br />
                    <strong className="text-foreground">안전한 교육 환경</strong>을 위해 담당자가<br />
                    <span className="text-primary underline decoration-2 underline-offset-4">해당 학교 행정실로 직접 전화</span>를 드려<br />
                    선생님의 재직 여부를 최종 확인하고 있습니다.
                </p>
            </div>

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

            <div className="pt-4">
                <button
                    onClick={logout}
                    className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-foreground-muted hover:text-foreground hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium"
                >
                    로그인 화면으로 돌아가기
                </button>
            </div>
        </div>
    );
}
