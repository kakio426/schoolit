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
}

export default function EvaluationModal({
    isOpen,
    onClose,
    onSubmit,
    type,
    applicantName,
    initialScores
}: EvaluationModalProps) {
    if (!isOpen) return null;

    const criteria =
        type === 'DOCUMENT' ? DOCUMENT_CRITERIA :
            type === 'INTERVIEW' ? INTERVIEW_CRITERIA :
                DEMO_CRITERIA;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
            <div className="relative w-full max-w-2xl my-8">
                <EvaluationScorecard
                    type={type}
                    criteria={criteria}
                    applicantName={applicantName}
                    initialScores={initialScores}
                    onSubmit={async (s, t, c) => {
                        await onSubmit(s, t, c);
                        onClose();
                    }}
                    onCancel={onClose}
                />
            </div>
        </div>
    );
}
