import React from 'react';
import EvaluationScorecard from './EvaluationScorecard';
import { DOCUMENT_CRITERIA, INTERVIEW_CRITERIA, DEMONSTRATION_CRITERIA as DEMO_CRITERIA } from '@/lib/constants/compliance';


interface EvaluationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (scores: Record<string, number>, total: number, comment: string) => Promise<void>;
    type: 'DOCUMENT' | 'INTERVIEW' | 'DEMONSTRATION';
    applicantName: string;
    initialScores?: Record<string, number>;
    initialData?: any;
}

export default function EvaluationModal({
    isOpen,
    onClose,
    onSubmit,
    type,
    applicantName,
    initialScores,
    initialData
}: EvaluationModalProps) {
    // 3 Evaluators by default for 2025 compliance
    const [evaluators, setEvaluators] = React.useState([
        { id: 1, name: '심사위원 1', scores: {} as Record<string, number>, comment: '', isComplete: false },
        { id: 2, name: '심사위원 2', scores: {} as Record<string, number>, comment: '', isComplete: false },
        { id: 3, name: '심사위원 3', scores: {} as Record<string, number>, comment: '', isComplete: false },
    ]);
    const [activeTab, setActiveTab] = React.useState(0);

    // Load initial data if present
    React.useEffect(() => {
        if (initialData?.evaluators) {
            setEvaluators(prev => prev.map((ev, idx) => {
                const loaded = initialData.evaluators[idx];
                if (loaded) {
                    return { ...ev, scores: loaded.scores, comment: loaded.comment, isComplete: true, name: loaded.name || ev.name, id: ev.id };
                }
                return ev;
            }));
        } else if (initialScores) {
            // Fallback for single legacy
            setEvaluators(prev => prev.map((ev, idx) => idx === 0 ? { ...ev, scores: initialScores, isComplete: true } : ev));
        }
    }, [initialData, initialScores]);

    const criteria =
        type === 'DOCUMENT' ? DOCUMENT_CRITERIA :
            type === 'INTERVIEW' ? INTERVIEW_CRITERIA :
                DEMO_CRITERIA;

    if (!isOpen) return null;

    const currentEvaluator = evaluators[activeTab];

    const handleEvaluatorSubmit = (scores: Record<string, number>, total: number, comment: string) => {
        setEvaluators(prev => prev.map((ev, idx) =>
            idx === activeTab ? { ...ev, scores, comment, isComplete: true } : ev
        ));

        // Move to next tab if available and incomplete
        if (activeTab < 2) {
            setActiveTab(activeTab + 1);
        }
    };

    const handleFinalSubmit = async () => {
        // Calculate average
        const totalSum = evaluators.reduce((acc, ev) => {
            const evTotal = Object.values(ev.scores).reduce((sum, s) => sum + (s || 0), 0);
            return acc + evTotal;
        }, 0);
        const average = totalSum / evaluators.length;

        // Construct payload
        // We pass the raw evaluators data + calculated stats
        // but the interface expects (scores, total, comment). 
        // We might need to adjust the onSubmit signature or overload it.
        // For now, passing average as total, and a summary comment.

        const payload = {
            type,
            evaluators: evaluators.map(e => ({
                name: e.name,
                score: Object.values(e.scores).reduce((a, b) => a + b, 0),
                scores: e.scores,
                comment: e.comment
            }))
        };

        // We cheat slightly on the type definition of onSubmit 
        // by passing the payload as the first arg and 0 as total.
        // The parent component should handle this payload structure.
        await onSubmit(payload as any, average, 'Aggregated Evaluation');
    };

    const isAllComplete = evaluators.every(e => e.isComplete);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
            <div className="relative w-full max-w-4xl my-8 flex flex-col md:flex-row gap-6">

                {/* Sidebar / Tabs */}
                <div className="w-full md:w-64 flex flex-col gap-2">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xl border border-white/10">
                        <h3 className="font-black text-lg mb-4 px-2">심사위원 관리</h3>
                        {evaluators.map((ev, idx) => (
                            <button
                                key={ev.id}
                                onClick={() => setActiveTab(idx)}
                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex justify-between items-center ${activeTab === idx
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'
                                    }`}
                            >
                                <span>{ev.name}</span>
                                {ev.isComplete && <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded text-white">완료</span>}
                            </button>
                        ))}
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xl border border-white/10 mt-auto">
                        <div className="text-xs font-black text-foreground-muted uppercase mb-1">현재 평균 점수</div>
                        <div className="text-3xl font-black text-primary">
                            {(evaluators.reduce((acc, ev) =>
                                acc + Object.values(ev.scores).reduce((s, c) => s + (c || 0), 0), 0
                            ) / evaluators.length).toFixed(1)}
                            <span className="text-sm font-medium text-slate-400">점</span>
                        </div>
                        <button
                            onClick={handleFinalSubmit}
                            disabled={!isAllComplete}
                            className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg transition-all"
                        >
                            최종 제출하기
                        </button>
                    </div>
                </div>

                {/* Scorecard Area */}
                <div className="flex-1">
                    <EvaluationScorecard
                        key={currentEvaluator.id} // Reset internal state when switching
                        type={type}
                        criteria={criteria}
                        applicantName={`${applicantName} (${currentEvaluator.name})`}
                        initialScores={currentEvaluator.scores}
                        initialComment={currentEvaluator.comment}
                        onSubmit={handleEvaluatorSubmit}
                        onCancel={onClose}
                    />
                </div>
            </div>
        </div>
    );
}
