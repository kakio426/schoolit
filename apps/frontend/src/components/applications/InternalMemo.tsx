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
        <div className="mt-4 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                    <span>📌</span> 학교 전용 메모 (지원자에게는 보이지 않음)
                </label>
                {lastSaved && (
                    <span className="text-[9px] text-amber-600/60 dark:text-amber-400/40">저장됨: {lastSaved}</span>
                )}
            </div>
            <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                onBlur={handleSave}
                placeholder="지원자에 대한 간단한 평가나 메모를 입력하세요..."
                className="w-full h-24 bg-transparent border-none focus:ring-0 text-sm text-foreground placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none p-0 leading-relaxed"
                disabled={isSaving}
            />
            <div className="flex justify-end mt-1">
                <span className="text-[9px] text-amber-700/40 italic">입력 후 포커스를 옮기면 자동 저장됩니다.</span>
            </div>
        </div>
    );
};

export default InternalMemo;
