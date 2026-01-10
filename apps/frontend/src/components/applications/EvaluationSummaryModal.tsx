import React from 'react';
import StandardCard from '@/components/ui/StandardCard';
import { JobApplication } from '@/types';
import { X, Trophy, Download } from 'lucide-react';
import { ApplicationStatus } from '@/lib/constants';

interface EvaluationSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    applicants: JobApplication[];
    jobTitle: string;
}

export default function EvaluationSummaryModal({
    isOpen,
    onClose,
    applicants,
    jobTitle
}: EvaluationSummaryModalProps) {
    if (!isOpen) return null;

    // Filter only active applicants (exclude rejected if desired, but usually summary includes all who were evaluated)
    // Actually, let's include everyone who has at least one evaluation or is in screening/interview/hired.
    const evaluatedApplicants = applicants.filter(app =>
        app.evaluations && app.evaluations.length > 0
    ).map(app => {
        const docScore = app.evaluations?.find(e => e.type === 'DOCUMENT')?.totalScore || 0;
        const interviewScore = app.evaluations?.find(e => e.type === 'INTERVIEW')?.totalScore || 0;
        const demoScore = app.evaluations?.find(e => e.type === 'DEMONSTRATION')?.totalScore || 0;
        const meritBonus = Math.max(...(app.evaluations?.map(e => e.meritBonus || 0) || [0]));

        const total = docScore + interviewScore + demoScore + meritBonus;
        return {
            ...app,
            docScore,
            interviewScore,
            demoScore,
            meritBonus,
            total
        };
    }).sort((a, b) => b.total - a.total); // Sort by total desc

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <StandardCard className="flex flex-col h-full shadow-2xl" noPadding>
                    <div className="p-6 bg-slate-900 text-white flex justify-between items-start shrink-0">
                        <div>
                            <div className="flex items-center gap-2 mb-1 opacity-80">
                                <Trophy className="w-4 h-4 text-amber-400" />
                                <span className="text-xs font-bold tracking-widest uppercase">EVALUATION SUMMARY</span>
                            </div>
                            <h2 className="text-xl font-black">{jobTitle} - 종합 평가 결과</h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto flex-1">
                        {evaluatedApplicants.length === 0 ? (
                            <div className="text-center py-10 text-slate-500">
                                아직 평가 데이터가 없습니다.
                            </div>
                        ) : (
                            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase text-xs">
                                        <tr>
                                            <th className="px-4 py-3 text-center w-16">순위</th>
                                            <th className="px-4 py-3">지원자</th>
                                            <th className="px-4 py-3 text-right">서류 점수</th>
                                            <th className="px-4 py-3 text-right">면접 점수</th>
                                            <th className="px-4 py-3 text-right">실연 점수</th>
                                            <th className="px-4 py-3 text-right text-amber-600">가산점</th>
                                            <th className="px-4 py-3 text-right">총점</th>
                                            <th className="px-4 py-3 text-center">상태</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {evaluatedApplicants.map((app, index) => (
                                            <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-4 py-3 text-center font-black text-slate-400">
                                                    {index === 0 ? <span className="text-amber-500">🥇</span> :
                                                        index === 1 ? <span className="text-slate-400">🥈</span> :
                                                            index === 2 ? <span className="text-orange-700">🥉</span> :
                                                                index + 1}
                                                </td>
                                                <td className="px-4 py-3 font-medium">
                                                    {app.user?.name}
                                                    <span className="text-xs text-slate-400 ml-2 font-normal">({app.user?.email})</span>
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-400">
                                                    {app.docScore > 0 ? app.docScore.toFixed(1) : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-400">
                                                    {app.interviewScore > 0 ? app.interviewScore.toFixed(1) : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-400">
                                                    {app.demoScore > 0 ? app.demoScore.toFixed(1) : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono text-amber-600">
                                                    {app.meritBonus > 0 ? `+${app.meritBonus.toFixed(1)}` : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-right font-black text-primary text-base">
                                                    {app.total.toFixed(1)}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${app.status === ApplicationStatus.HIRED ? 'bg-emerald-100 text-emerald-600' :
                                                        app.status === ApplicationStatus.REJECTED ? 'bg-red-100 text-red-600' :
                                                            'bg-slate-100 text-slate-500'
                                                        }`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs text-slate-500 leading-relaxed border border-slate-100 dark:border-slate-800">
                            <strong>[참고]</strong> 총점은 서류 점수와 면접 점수의 단순 합산입니다. 동점자 발생 시 면접 점수 우위, 경력순 등 내부 규정을 따릅니다.
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 shrink-0 flex justify-end">
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors"
                        >
                            <Download className="w-4 h-4" /> 인쇄 / PDF 저장
                        </button>
                    </div>
                </StandardCard>
            </div>
        </div>
    );
}
