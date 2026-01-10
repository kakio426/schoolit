'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center space-y-4">
            <div className="text-4xl">⚠️</div>
            <h2 className="text-xl font-bold text-red-500">대시보드 정보를 불러오지 못했습니다.</h2>
            <p className="text-slate-500">일시적인 오류일 수 있습니다. 잠시 후 다시 시도해주세요.</p>
            <button
                onClick={() => reset()}
                className="px-6 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg font-medium transition-colors"
            >
                다시 시도
            </button>
        </div>
    );
}
