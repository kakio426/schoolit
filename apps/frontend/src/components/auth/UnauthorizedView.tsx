import React from 'react';
import { useRouter } from 'next/navigation';

export default function UnauthorizedView() {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-surface p-4 text-center animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mb-6">
                <span className="text-4xl">🔒</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">접근 권한이 없습니다</h1>
            <p className="text-foreground-muted mb-8 max-w-sm">
                로그인이 필요하거나 세션이 만료되었습니다. <br />
                다시 로그인해 주세요.
            </p>
            <div className="flex gap-4">
                <button
                    onClick={() => router.push('/')}
                    className="px-6 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all active:scale-95"
                >
                    로그인 화면으로 이동
                </button>
            </div>
        </div>
    );
}
