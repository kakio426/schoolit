import React from 'react';
import { JobType } from '@/lib/constants';
import { WizardFormData } from './schema';

interface Step3Props {
    formData: WizardFormData;
    jobType: JobType;
}

export default function Step3Preview({ formData, jobType }: Step3Props) {
    const isTeacher = jobType === JobType.TEACHER_HIRING;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground">3. 최종 확인</h3>
                <p className="text-foreground-muted text-sm">입력하신 내용이 맞는지 내용을 확인해주세요. 등록 후에는 수정이 제한될 수 있습니다.</p>
            </div>

            <div className="bg-surface rounded-3xl border border-border shadow-md overflow-hidden">
                {/* Header Preview */}
                <div className="bg-primary/5 p-6 border-b border-border">
                    <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-1 text-[10px] font-black rounded-lg ${isTeacher
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                            }`}>
                            {isTeacher ? '강사 채용' : '행사 업체'}
                        </span>
                        {formData.hiringReason && (
                            <span className="px-2 py-1 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg">
                                {formData.hiringReason === 'SICK_LEAVE' ? '병가 대체' : formData.hiringReason}
                            </span>
                        )}
                        <span className="ml-auto text-xs font-bold text-foreground-muted">
                            {new Date().toLocaleDateString()} 작성
                        </span>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">{formData.title}</h2>
                    <div className="flex items-center gap-4 text-sm text-foreground-muted">
                        <span>🏫 {formData.regions}</span>
                        <span>📚 {formData.subjects}</span>
                    </div>
                </div>

                {/* Body Preview */}
                <div className="p-6 space-y-6">
                    <div>
                        <h4 className="font-bold text-foreground mb-2 text-sm">상세 내용</h4>
                        <div className="p-4 bg-background rounded-xl border border-border text-sm leading-relaxed whitespace-pre-wrap">
                            {formData.description}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-bold text-foreground mb-2 text-sm">예산 / 급여</h4>
                            <div className="p-3 bg-background rounded-xl border border-border font-mono font-bold text-lg text-primary">
                                {formData.budget === '0' || formData.budget === 0
                                    ? '규정에 따름'
                                    : `₩ ${parseInt(String(formData.budget)).toLocaleString()}`}
                            </div>
                        </div>
                        {isTeacher ? (
                            <div>
                                <h4 className="font-bold text-foreground mb-2 text-sm">계약 기간</h4>
                                <div className="p-3 bg-background rounded-xl border border-border text-sm font-medium">
                                    {formData.contractPeriod || '-'}
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h4 className="font-bold text-foreground mb-2 text-sm">행사 기간</h4>
                                <div className="p-3 bg-background rounded-xl border border-border text-sm font-medium">
                                    {formData.eventDuration || '-'}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Compliance Checklist Summary */}
                    <div className="pt-4 border-t border-border">
                        <h4 className="font-bold text-foreground mb-3 text-sm flex items-center gap-2">
                            <span className="text-emerald-500">✓</span> 행정 확인 완료
                        </h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {Object.entries(formData.internalChecklist).map(([key, value]) => (
                                value && (
                                    <li key={key} className="text-xs text-foreground-muted flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                        {key === 'planningApproved' && '내부 기안/결재 완료'}
                                        {key === 'budgetConfirmed' && '예산 확보 확인'}
                                        {key === 'vacancyConfirmed' && '결원/규격 확인'}
                                    </li>
                                )
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
