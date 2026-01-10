'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Dashboard Error:', error);
    }, [error]);

    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center space-y-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-500" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">문제가 발생했습니다</h2>
            <p className="text-muted-foreground text-center max-w-md px-4">
                대시보드를 불러오는 도중 오류가 발생했습니다.<br />
                잠시 후 다시 시도해주세요.
            </p>
            <div className="flex gap-2">
                <button
                    onClick={() => reset()}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
                >
                    다시 시도
                </button>
                <button
                    onClick={() => window.location.reload()}
                    className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-semibold hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                    새로고침
                </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-900 rounded-lg max-w-lg overflow-auto text-xs font-mono text-red-500">
                    {error.message}
                </div>
            )}
        </div>
    );
}
