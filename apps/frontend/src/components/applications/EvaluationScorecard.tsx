import React, { useState, useEffect } from 'react';
import { Calculator, Save, X, AlertCircle } from 'lucide-react';
import StandardCard from '@/components/ui/StandardCard';

interface Criteria {
    id: string;
    label: string;
    maxScore: number;
    description: string;
}

interface EvaluationScorecardProps {
    type: 'DOCUMENT' | 'INTERVIEW' | 'DEMONSTRATION';
    criteria: readonly Criteria[];
    onSubmit: (scores: Record<string, number>, total: number, comment: string) => void;
    onCancel: () => void;
    applicantName: string;
    initialScores?: Record<string, number>;
    initialComment?: string;
}

export default function EvaluationScorecard({
    type,
    criteria,
    onSubmit,
    onCancel,
    applicantName,
    initialScores = {},
    initialComment = ''
}: EvaluationScorecardProps) {
    const [scores, setScores] = useState<Record<string, number>>(initialScores);
    const [comment, setComment] = useState(initialComment);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const totalScore = Object.values(scores).reduce((sum, score) => sum + (score || 0), 0);
    const maxTotalScore = criteria.reduce((sum, c) => sum + c.maxScore, 0);

    const handleScoreChange = (id: string, value: string, max: number) => {
        const numValue = value === '' ? 0 : Number(value);

        if (numValue < 0) return;

        if (numValue > max) {
            setErrors(prev => ({ ...prev, [id]: `최대 ${max}점까지 입력 가능합니다.` }));
        } else {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[id];
                return newErrors;
            });
        }

        setScores(prev => ({ ...prev, [id]: numValue }));
    };

    const handleSubmit = () => {
        // Validation check
        const hasErrors = Object.keys(errors).length > 0;
        const incomplete = criteria.some(c => scores[c.id] === undefined);

        if (hasErrors) {
            alert('점수 입력 오류를 수정해주세요.');
            return;
        }

        // Allow incomplete? Usually no.
        onSubmit(scores, totalScore, comment);
    };

    return (
        <StandardCard className="max-w-2xl mx-auto w-full shadow-2xl animate-in zoom-in-95 duration-200" noPadding>
            {/* Header */}
            <div className="bg-slate-900 text-white p-6 flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-1 opacity-80">
                        <Calculator className="w-4 h-4" />
                        <span className="text-xs font-bold tracking-widest uppercase">
                            {type === 'DOCUMENT' ? '서류 심사' : type === 'INTERVIEW' ? '면접 심사' : '수업 실연'}
                        </span>
                    </div>
                    <h2 className="text-xl font-black">{applicantName} 님 평가표</h2>
                </div>
                <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Body */}
            <div className="p-8 space-y-6">
                <div className="grid gap-6">
                    {criteria.map((item) => (
                        <div key={item.id} className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-foreground">{item.label}</h3>
                                    <span className="text-xs px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded-full font-mono text-foreground-muted">Max {item.maxScore}</span>
                                </div>
                                <p className="text-sm text-foreground-muted mt-1">{item.description}</p>
                            </div>

                            <div className="flex flex-col items-end">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        className={`w-20 px-3 py-2 text-right font-black text-lg border rounded-xl outline-none focus:ring-2 transition-all ${errors[item.id] ? 'border-red-500 focus:ring-red-200 text-red-600' : 'border-slate-200 focus:ring-primary/20 text-primary'}`}
                                        value={scores[item.id] === 0 ? '' : scores[item.id]} // Display empty string instead of 0 for UX
                                        onChange={(e) => handleScoreChange(item.id, e.target.value, item.maxScore)}
                                        placeholder="0"
                                        min="0"
                                        max={item.maxScore}
                                    />
                                    <span className="text-sm font-bold text-foreground-muted">점</span>
                                </div>
                                {errors[item.id] && (
                                    <div className="mt-1 flex items-center gap-1 text-[10px] text-red-500 font-bold animate-pulse">
                                        <AlertCircle className="w-3 h-3" /> {errors[item.id]}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black text-foreground-muted uppercase ml-1">심사평 (선택)</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="심사에 대한 구체적인 의견이나 특이사항을 기록하세요."
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all font-medium h-32"
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                    <div className="text-xs font-bold text-foreground-muted uppercase">총점 합계</div>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-3xl font-black ${totalScore > maxTotalScore ? 'text-red-500' : 'text-primary'}`}>{totalScore}</span>
                        <span className="text-lg font-bold text-slate-400">/ {maxTotalScore}</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="px-6 py-3 font-bold text-foreground-muted hover:text-foreground transition-colors"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={Object.keys(errors).length > 0}
                        className="px-8 py-3 bg-primary text-white rounded-xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-4 h-4" /> 심사 완료
                    </button>
                </div>
            </div>
        </StandardCard>
    );
}
