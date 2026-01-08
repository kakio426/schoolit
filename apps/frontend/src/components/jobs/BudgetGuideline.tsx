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

    const [acknowledged, setAcknowledged] = React.useState(false);

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
        title = '🔴 경쟁 입찰 필수 (S2B/G2B 사용 의무)';
        description = '2천만 원을 초과하는 공사는 반드시 지정정보처리장치(S2B/G2B)를 통해 진행해야 합니다. 스쿨잇에서의 견적은 "시장 조사(예산 산출)" 목적으로만 활용해 주세요.';
        action = '이 견적서는 계약용이 아닌 "행정실 제출용 기초 견적"입니다.';
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
                <div className="flex-1">
                    <h4 className="font-bold text-sm mb-1">{title}</h4>
                    <p className="text-xs opacity-90 leading-relaxed whitespace-pre-line">{description}</p>
                    <div className="mt-2 text-xs font-bold bg-white/50 dark:bg-black/20 px-2 py-1 rounded w-fit">
                        💡 Action: {action}
                    </div>

                    {status === 'danger' && (
                        <label className="flex items-start gap-2 mt-3 pt-3 border-t border-red-200 dark:border-red-800 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={acknowledged}
                                onChange={(e) => setAcknowledged(e.target.checked)}
                                className="mt-0.5 rounded border-red-300 text-red-600 focus:ring-red-500 bg-white dark:bg-black/40"
                            />
                            <span className="text-xs font-semibold select-none group-hover:underline">
                                네, 위 내용을 인지하였으며 시장 조사 목적으로만 진행하겠습니다.
                            </span>
                        </label>
                    )}
                </div>
            </div>
        </div>
    );
}
