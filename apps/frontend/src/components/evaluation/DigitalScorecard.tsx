'use client';

import React, { useState } from 'react';
import { Save, RotateCcw, User, Award } from 'lucide-react';
import {
    DOCUMENT_CRITERIA,
    INTERVIEW_CRITERIA,
    DEMONSTRATION_CRITERIA,
    MERIT_BONUS_RULES
} from '@/lib/constants/compliance';

type EvaluationType = 'DOCUMENT' | 'INTERVIEW' | 'DEMONSTRATION';

interface ScorecardProps {
    type: EvaluationType;
    applicantName: string;
    evaluatorName: string;
    onSave: (scores: Record<string, number>, totalScore: number, meritBonus: number, comment: string) => void;
    onCancel: () => void;
}

const TYPE_CONFIG = {
    DOCUMENT: {
        title: '1차 서류전형 평가표',
        subtitle: '(서식 12)',
        criteria: DOCUMENT_CRITERIA,
        maxTotal: 30,
        color: 'blue',
    },
    INTERVIEW: {
        title: '2차 면접시험 평가표',
        subtitle: '(서식 13)',
        criteria: INTERVIEW_CRITERIA,
        maxTotal: 40,
        color: 'green',
    },
    DEMONSTRATION: {
        title: '3차 수업실연 평가표',
        subtitle: '(서식 14)',
        criteria: DEMONSTRATION_CRITERIA,
        maxTotal: 30,
        color: 'purple',
    },
};

export default function DigitalScorecard({ type, applicantName, evaluatorName, onSave, onCancel }: ScorecardProps) {
    const config = TYPE_CONFIG[type];
    const [scores, setScores] = useState<Record<string, number>>(() => {
        const initial: Record<string, number> = {};
        config.criteria.forEach(c => { initial[c.id] = 0; });
        return initial;
    });
    const [comment, setComment] = useState('');
    const [hasMeritBonus, setHasMeritBonus] = useState(false);
    const [meritBonusType, setMeritBonusType] = useState<'VETERAN_10' | 'VETERAN_5' | null>(null);

    const totalScore = Object.values(scores).reduce((sum, s) => sum + s, 0);
    const meritBonusValue = meritBonusType
        ? totalScore * MERIT_BONUS_RULES[meritBonusType].bonus
        : 0;
    const finalScore = totalScore + meritBonusValue;

    const handleScoreChange = (criteriaId: string, value: number, maxScore: number) => {
        const clampedValue = Math.max(0, Math.min(value, maxScore));
        setScores(prev => ({ ...prev, [criteriaId]: clampedValue }));
    };

    const handleSliderChange = (criteriaId: string, value: number) => {
        setScores(prev => ({ ...prev, [criteriaId]: value }));
    };

    const handleReset = () => {
        const reset: Record<string, number> = {};
        config.criteria.forEach(c => { reset[c.id] = 0; });
        setScores(reset);
        setComment('');
        setHasMeritBonus(false);
        setMeritBonusType(null);
    };

    const handleSave = () => {
        onSave(scores, totalScore, meritBonusValue, comment);
    };

    const getProgressColor = () => {
        const percentage = (totalScore / config.maxTotal) * 100;
        if (percentage >= 80) return 'bg-success';
        if (percentage >= 50) return 'bg-warning';
        return 'bg-slate-300';
    };

    return (
        <div className="bg-surface rounded-3xl border border-border shadow-xl overflow-hidden">
            {/* Header */}
            <div className={`p-6 bg-${config.color}-50 dark:bg-${config.color}-900/20 border-b border-border`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">{config.title}</h2>
                        <p className="text-foreground-muted text-sm">{config.subtitle}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-black text-primary">{totalScore}<span className="text-lg text-foreground-muted">/{config.maxTotal}</span></div>
                        {meritBonusValue > 0 && (
                            <div className="text-sm text-success font-bold">+{meritBonusValue.toFixed(1)} 가산</div>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${getProgressColor()} transition-all duration-300`}
                        style={{ width: `${(totalScore / config.maxTotal) * 100}%` }}
                    />
                </div>
            </div>

            {/* Applicant & Evaluator Info */}
            <div className="p-4 bg-background flex gap-4 border-b border-border">
                <div className="flex items-center gap-2 px-4 py-2 bg-surface rounded-xl border border-border">
                    <User className="w-4 h-4 text-foreground-muted" />
                    <span className="text-sm"><span className="text-foreground-muted">지원자:</span> <span className="font-bold">{applicantName}</span></span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-surface rounded-xl border border-border">
                    <Award className="w-4 h-4 text-foreground-muted" />
                    <span className="text-sm"><span className="text-foreground-muted">심사위원:</span> <span className="font-bold">{evaluatorName}</span></span>
                </div>
            </div>

            {/* Scoring Section */}
            <div className="p-6 space-y-6">
                {config.criteria.map((criteria) => (
                    <div key={criteria.id} className="p-4 bg-background rounded-2xl border border-border">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <span className="font-bold text-foreground">{criteria.label}</span>
                                <p className="text-xs text-foreground-muted mt-1">{criteria.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={scores[criteria.id]}
                                    onChange={(e) => handleScoreChange(criteria.id, parseInt(e.target.value) || 0, criteria.maxScore)}
                                    className="w-16 h-10 text-center font-bold text-lg border border-border rounded-lg bg-surface focus:border-primary outline-none"
                                    min={0}
                                    max={criteria.maxScore}
                                />
                                <span className="text-foreground-muted font-bold">/ {criteria.maxScore}</span>
                            </div>
                        </div>

                        {/* Slider */}
                        <input
                            type="range"
                            value={scores[criteria.id]}
                            onChange={(e) => handleSliderChange(criteria.id, parseInt(e.target.value))}
                            min={0}
                            max={criteria.maxScore}
                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                        />

                        {/* Quick Score Buttons */}
                        <div className="flex gap-2 mt-3">
                            {[0, Math.floor(criteria.maxScore / 2), criteria.maxScore].map(val => (
                                <button
                                    key={val}
                                    type="button"
                                    onClick={() => handleScoreChange(criteria.id, val, criteria.maxScore)}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${scores[criteria.id] === val
                                            ? 'bg-primary text-white'
                                            : 'bg-surface border border-border text-foreground-muted hover:bg-surface-hover'
                                        }`}
                                >
                                    {val === 0 ? '미흡' : val === criteria.maxScore ? '우수' : '보통'}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Merit Bonus Section */}
                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-800">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={hasMeritBonus}
                            onChange={(e) => {
                                setHasMeritBonus(e.target.checked);
                                if (!e.target.checked) setMeritBonusType(null);
                            }}
                            className="w-5 h-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="font-bold text-amber-800 dark:text-amber-400">국가유공자 가산점 적용</span>
                    </label>

                    {hasMeritBonus && (
                        <div className="mt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setMeritBonusType('VETERAN_10')}
                                className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all ${meritBonusType === 'VETERAN_10'
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-white dark:bg-slate-800 border border-amber-300 text-amber-700'
                                    }`}
                            >
                                10% 가산 (본인)
                            </button>
                            <button
                                type="button"
                                onClick={() => setMeritBonusType('VETERAN_5')}
                                className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all ${meritBonusType === 'VETERAN_5'
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-white dark:bg-slate-800 border border-amber-300 text-amber-700'
                                    }`}
                            >
                                5% 가산 (가족)
                            </button>
                        </div>
                    )}
                </div>

                {/* Comment */}
                <div>
                    <label className="block text-sm font-bold text-foreground mb-2">심사평 (선택)</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                        placeholder="지원자에 대한 종합 의견을 작성해주세요."
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary outline-none resize-none"
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border bg-background/30 flex justify-between">
                <button
                    type="button"
                    onClick={handleReset}
                    className="px-6 py-3 text-foreground-muted font-bold rounded-xl hover:bg-surface-hover transition-colors flex items-center gap-2"
                >
                    <RotateCcw className="w-4 h-4" />
                    초기화
                </button>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-foreground-muted font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        저장
                    </button>
                </div>
            </div>
        </div>
    );
}
