
import React from 'react';
import { ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface CompletenessWidgetProps {
    completeness: {
        percentage: number;
        missingFields: string[];
    };
}

export const CompletenessWidget: React.FC<CompletenessWidgetProps> = ({ completeness }) => {
    const { percentage, missingFields } = completeness;

    if (percentage === 100) return null; // Or return a minimized "Master" badge version

    let message = '프로필을 작성하고 신뢰도를 높이세요!';
    let messageColor = 'text-slate-600 dark:text-slate-400';

    if (percentage >= 80) {
        message = `완성까지 단 한 걸음! ${missingFields[0]}만 입력해보세요.`;
        messageColor = 'text-primary font-medium';
    } else if (percentage >= 50) {
        message = '조금만 더 채우면 매칭 확률이 올라갑니다.';
        messageColor = 'text-slate-700 dark:text-slate-300';
    }

    return (
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden group">
            {/* Background Decorative Gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-foreground">프로필 완성도</h3>
                        <span className="text-2xl font-black text-primary">{percentage}%</span>
                    </div>
                    <Link
                        href="/dashboard/settings"
                        className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center transition-colors bg-primary/10 px-3 py-1.5 rounded-lg"
                    >
                        채우러 가기 <ChevronRight className="w-3 h-3 ml-1" />
                    </Link>
                </div>

                {/* Progress Bar */}
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-accent-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                        style={{ width: `${percentage}%` }}
                    />
                </div>

                <div className={`text-sm flex items-center gap-2 ${messageColor}`}>
                    {percentage >= 80 ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4 opacity-50" />}
                    {message}
                </div>
            </div>
        </div>
    );
};
