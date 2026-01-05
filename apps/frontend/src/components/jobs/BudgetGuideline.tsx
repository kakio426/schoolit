import React from 'react';

interface BudgetGuidelineProps {
    budget: number;
}

export function BudgetGuideline({ budget }: BudgetGuidelineProps) {
    if (!budget || budget <= 0) return null;

    let status: 'safe' | 'warning' | 'danger' = 'safe';
    let title = '';
    let description = '';
    let action = '';

    if (budget <= 20000000) {
        status = 'safe';
        title = '🟢 1인 견적 수의계약 가능';
        description = '가장 간편한 절차입니다. 선생님이 추천한 업체 1곳과 바로 계약하거나, 행정실에서 S2B를 통해 빠르게 선정할 수 있습니다.';
        action = '추천 업체가 있다면 행정실에 알려주세요.';
    } else if (budget <= 50000000) {
        status = 'warning';
        title = '🟡 2인 이상 견적 필요 (소액수의 공고)';
        description = '특정 업체 1곳과 바로 계약할 수 없습니다. S2B(학교장터)나 G2B(나라장터)에 공고를 올려 최소 2개 이상의 업체로부터 견적을 받아야 합니다.';
        action = '행정실에 "소액수의 공고"를 요청하세요.';
    } else {
        status = 'danger';
        title = '🔴 경쟁 입찰 필수';
        description = '절차가 매우 까다롭습니다. 입찰 공고(G2B)를 통해 진행해야 하며, 규격/가격 분리 입찰 등 복잡한 심사가 필요합니다. 행정실과 사전에 긴밀히 협의해야 합니다.';
        action = '즉시 행정실과 예산 및 입찰 방식 협의가 필요합니다.';
    }

    const colors = {
        safe: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300',
        warning: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300',
        danger: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300',
    };

    return (
        <div className={`mt-3 p-4 rounded-xl border ${colors[status]} animate-in fade-in slide-in-from-top-2 duration-300`}>
            <div className="flex gap-3">
                <div className="shrink-0 pt-1">
                    {status === 'safe' && '✅'}
                    {status === 'warning' && '📢'}
                    {status === 'danger' && '🚨'}
                </div>
                <div>
                    <h4 className="font-bold text-sm mb-1">{title}</h4>
                    <p className="text-xs opacity-90 leading-relaxed">{description}</p>
                    <div className="mt-2 text-xs font-bold bg-white/50 dark:bg-black/20 px-2 py-1 rounded w-fit">
                        💡 Action: {action}
                    </div>
                </div>
            </div>
        </div>
    );
}
