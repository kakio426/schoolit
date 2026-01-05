import React from 'react';
import { ApplicationStatus } from '@/lib/constants';

interface RecruitmentPipelineProps {
    status: ApplicationStatus;
    isSuggestion?: boolean;
}

const RecruitmentPipeline: React.FC<RecruitmentPipelineProps> = ({ status, isSuggestion }) => {
    const stages = [
        { key: ApplicationStatus.PENDING, label: isSuggestion ? '제안됨' : '접수' },
        { key: ApplicationStatus.DOCUMENT_SCREENING, label: '서류심사' },
        { key: ApplicationStatus.INTERVIEWING, label: '면접/시연' },
        { key: ApplicationStatus.VERIFICATION, label: '결격조회' },
        { key: ApplicationStatus.HIRED, label: '채용확정' },
    ];

    const getCurrentStageIndex = () => {
        if (status === ApplicationStatus.REJECTED) return -1;
        return stages.findIndex(s => s.key === status);
    };

    const currentIndex = getCurrentStageIndex();

    return (
        <div className="w-full mt-4 mb-2">
            <div className="flex items-center justify-between relative">
                {/* Background Line */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 z-0"></div>

                {/* Progress Line */}
                <div
                    className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-500"
                    style={{ width: `${currentIndex >= 0 ? (currentIndex / (stages.length - 1)) * 100 : 0}%` }}
                ></div>

                {stages.map((stage, idx) => {
                    const isCompleted = idx < currentIndex;
                    const isCurrent = idx === currentIndex;
                    const isPending = idx > currentIndex;

                    return (
                        <div key={stage.key} className="flex flex-col items-center z-10 relative">
                            <div className={`
                                w-3 h-3 rounded-full border-2 transition-all duration-300
                                ${isCompleted ? 'bg-primary border-primary shadow-[0_0_8px_rgba(99,102,241,0.5)]' : ''}
                                ${isCurrent ? 'bg-white dark:bg-slate-900 border-primary scale-125' : ''}
                                ${isPending ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700' : ''}
                            `}></div>
                            <span className={`
                                text-[10px] mt-2 font-bold transition-colors duration-300
                                ${isCurrent ? 'text-primary' : 'text-foreground-muted'}
                                ${isCompleted ? 'text-foreground' : ''}
                            `}>
                                {stage.label}
                            </span>
                        </div>
                    );
                })}
            </div>
            {status === ApplicationStatus.REJECTED && (
                <div className="text-center mt-2">
                    <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full border border-red-100 dark:border-red-900/30">지원 거절됨</span>
                </div>
            )}
        </div>
    );
};

export default RecruitmentPipeline;
