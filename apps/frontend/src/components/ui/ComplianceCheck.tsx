import React, { useState, useEffect } from 'react';

interface ComplianceCheckProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    candidateName: string;
}

export default function ComplianceCheck({ isOpen, onClose, onConfirm, candidateName }: ComplianceCheckProps) {
    const [checks, setChecks] = useState({
        sexOffender: false,
        liability: false,
    });

    // Reset checks when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setChecks({ sexOffender: false, liability: false });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const allChecked = checks.sexOffender && checks.liability;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full p-8 border border-white/10 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex flex-col space-y-6">
                    <div className="text-center">
                        <div className="inline-flex p-3 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 mb-4">
                            <span className="text-2xl">⚖️</span>
                        </div>
                        <h3 className="text-xl font-bold text-foreground">채용 확정 전 필수 확인</h3>
                        <p className="text-sm text-foreground-muted mt-2">
                            <span className="font-bold text-primary">{candidateName}</span> 선생님을 채용하기 전, 다음 법적 의무 사항을 반드시 확인해야 합니다.
                        </p>
                    </div>

                    <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative flex items-center mt-0.5">
                                <input
                                    type="checkbox"
                                    className="peer h-5 w-5 appearance-none rounded border border-slate-300 bg-white checked:bg-primary checked:border-primary transition-all cursor-pointer"
                                    checked={checks.sexOffender}
                                    onChange={(e) => setChecks({ ...checks, sexOffender: e.target.checked })}
                                />
                                <span className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 text-xs">✔</span>
                            </div>
                            <span className="text-sm text-foreground group-hover:text-primary transition-colors leading-relaxed">
                                (필수) 관계 법령에 따라 대상자의 <b>성범죄 경력 및 아동학대 관련 범죄 전력</b>을 직접 조회하였으며, 결격 사유가 없음을 확인했습니다.
                            </span>
                        </label>

                        <div className="w-full h-px bg-slate-200 dark:bg-slate-700/50"></div>

                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative flex items-center mt-0.5">
                                <input
                                    type="checkbox"
                                    className="peer h-5 w-5 appearance-none rounded border border-slate-300 bg-white checked:bg-primary checked:border-primary transition-all cursor-pointer"
                                    checked={checks.liability}
                                    onChange={(e) => setChecks({ ...checks, liability: e.target.checked })}
                                />
                                <span className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 text-xs">✔</span>
                            </div>
                            <span className="text-sm text-foreground group-hover:text-primary transition-colors leading-relaxed">
                                (필수) 본 채용은 에듀핀이 아닌 <b>학교 장의 책임 하에 이루어지는 계약</b>임을 확인하며, 추후 발생하는 노무 분쟁에 대해 플랫폼은 면책됨을 동의합니다.
                            </span>
                        </label>
                    </div>

                    <div className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50">
                        🔒 에듀핀은 조회 대행 서비스를 제공하지 않으며, 관련 정보를 서버에 저장하지 않습니다.
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="py-3.5 rounded-xl font-medium text-foreground-muted hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            취소
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={!allChecked}
                            className={`py-3.5 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 ${allChecked
                                    ? 'bg-primary hover:bg-primary/90 shadow-primary/25 cursor-pointer'
                                    : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed text-slate-500 shadow-none'
                                }`}
                        >
                            채용 확정하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
