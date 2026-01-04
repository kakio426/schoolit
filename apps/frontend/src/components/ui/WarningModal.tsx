import React from 'react';

interface WarningModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
    type?: 'danger' | 'warning';
    primaryAction?: {
        label: string;
        onClick: () => void;
    };
}

export default function WarningModal({ isOpen, onClose, title, description, type = 'warning', primaryAction }: WarningModalProps) {
    if (!isOpen) return null;

    const isDanger = type === 'danger';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-8 border border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header Decoration */}
                <div className={`absolute top-0 left-0 w-full h-2 ${isDanger ? 'bg-red-500' : 'bg-amber-500'}`} />

                <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`p-4 rounded-full mb-2 ${isDanger ? 'bg-red-100 text-red-500 dark:bg-red-900/30' : 'bg-amber-100 text-amber-500 dark:bg-amber-900/30'}`}>
                        <span className="text-3xl">⚠️</span>
                    </div>

                    <h3 className={`text-xl font-bold ${isDanger ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {title}
                    </h3>

                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {description}
                    </p>

                    <div className="w-full pt-6 space-y-3">
                        {primaryAction && (
                            <button
                                onClick={primaryAction.onClick}
                                className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 ${isDanger
                                        ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                                        : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                                    }`}
                            >
                                {primaryAction.label}
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="w-full py-3 rounded-xl font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            닫기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
