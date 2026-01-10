import React from 'react';
import { ApplicationStatus, JobType } from '@/lib/constants';
import { Check } from 'lucide-react';

interface RecruitmentPipelineProps {
    status: ApplicationStatus;
    isSuggestion?: boolean;
    jobType?: JobType;
}

const RecruitmentPipeline: React.FC<RecruitmentPipelineProps> = ({ status, isSuggestion, jobType }) => {
    const teacherStages = [
        { key: ApplicationStatus.PENDING, label: isSuggestion ? '제안' : '접수' },
        { key: ApplicationStatus.DOCUMENT_SCREENING, label: '서류' },
        { key: ApplicationStatus.INTERVIEWING, label: '면접' },
        { key: ApplicationStatus.VERIFICATION, label: '검증' },
        { key: ApplicationStatus.HIRED, label: '완료' },
    ];

    const eventStages = [
        { key: ApplicationStatus.PENDING, label: '접수' },
        { key: ApplicationStatus.BIDDING, label: '선정' },
        { key: ApplicationStatus.CONTRACTING, label: '계약' },
        { key: ApplicationStatus.EXECUTING, label: '수행' },
        { key: ApplicationStatus.PAYMENT_COMPLETED, label: '지급' },
    ];

    const stages = jobType === JobType.EVENT_VENDOR ? eventStages : teacherStages;

    const getCurrentStageIndex = () => {
        if (status === ApplicationStatus.REJECTED) return -1;
        const idx = stages.findIndex(s => s.key === status);
        // If it's a specialty status like BIDDING/CONTRACTING but using teacher stages (unlikely but safe), or vice versa
        return idx;
    };

    const currentIndex = getCurrentStageIndex();

    return (
        <div className="w-full mt-6 mb-2 px-1">
            <div className="flex items-center justify-between relative">
                {/* Background Line (Ultra Thin) */}
                <div className="absolute top-[10px] left-0 w-full h-[1px] bg-white/[0.06] z-0"></div>

                {/* Progress Line (Brand Blue) */}
                <div
                    className="absolute top-[10px] left-0 h-[1px] bg-blue-500/80 z-0 transition-all duration-700 ease-in-out"
                    style={{ width: `${currentIndex >= 0 ? (currentIndex / (stages.length - 1)) * 100 : 0}%` }}
                ></div>

                {stages.map((stage, idx) => {
                    const isCompleted = idx < currentIndex;
                    const isCurrent = idx === currentIndex;
                    const isPending = idx > currentIndex;

                    return (
                        <div key={stage.key} className="flex flex-col items-center z-10 relative">
                            {/* Connection Node */}
                            <div className={`
                                w-[20px] h-[20px] rounded-full flex items-center justify-center transition-all duration-500
                                ${isCompleted ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.3)]' : ''}
                                ${isCurrent ? 'bg-zinc-950 border border-blue-500/50 scale-110 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : ''}
                                ${isPending ? 'bg-zinc-900 border border-white/[0.08]' : ''}
                            `}>
                                {isCompleted ? (
                                    <Check size={10} strokeWidth={4} />
                                ) : (
                                    <div className={`w-1 h-1 rounded-full ${isCurrent ? 'bg-blue-500' : 'bg-white/20'}`} />
                                )}
                            </div>

                            {/* Label */}
                            <span className={`
                                text-[9px] mt-2.5 font-bold tracking-tight transition-colors duration-300
                                ${isCurrent ? 'text-blue-400' : 'text-zinc-500'}
                                ${isCompleted ? 'text-zinc-300' : ''}
                            `}>
                                {stage.label}
                            </span>
                        </div>
                    );
                })}
            </div>
            {status === ApplicationStatus.REJECTED && (
                <div className="text-center mt-4">
                    <span className="text-[9px] font-black tracking-widest uppercase text-red-500/80 bg-red-500/5 px-2.5 py-1 rounded border border-red-500/10">Rejected</span>
                </div>
            )}
        </div>
    );
};

export default RecruitmentPipeline;
