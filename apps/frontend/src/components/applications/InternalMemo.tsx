import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface InternalMemoProps {
    applicationId: number;
    initialMemo?: string;
}

const InternalMemo: React.FC<InternalMemoProps> = ({ applicationId, initialMemo = '' }) => {
    const [memo, setMemo] = useState(initialMemo);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<string | null>(null);

    useEffect(() => {
        setMemo(initialMemo);
    }, [initialMemo]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.patch(`/applications/${applicationId}/note`, { note: memo });
            setLastSaved(new Date().toLocaleTimeString());
        } catch (e) {
            console.error('Failed to save memo', e);
            alert('메모 저장에 실패했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="mt-4 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                    <span className="text-base">🔒</span>
                    <span>학교 전용 메모 (지원자에게는 보이지 않음)</span>
                </label>
                {lastSaved && (
                    <span className="text-[10px] bg-white dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-100 dark:border-amber-800 shadow-sm animate-in fade-in slide-in-from-right-2">
                        저장됨: {lastSaved}
                    </span>
                )}
            </div>
            <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                onBlur={handleSave}
                placeholder="지원자에 대한 간단한 평가나 면접 기록을 남기세요. (자동 저장됨)"
                className="w-full h-24 bg-white/50 dark:bg-black/20 border border-amber-100 dark:border-amber-800/30 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 dark:focus:border-amber-600 transition-all text-sm text-foreground placeholder:text-foreground-muted/70 p-4 resize-none leading-relaxed outline-none"
                disabled={isSaving}
            />
            <div className="flex justify-end mt-2">
                <span className="text-[10px] text-amber-700/50 dark:text-amber-500 italic flex items-center gap-1">
                    <span>⚡</span> 입력 후 포커스를 옮기면 자동 저장됩니다.
                </span>
            </div>
        </div>
    );
};

export default InternalMemo;
