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
        <div className="mt-6 bg-zinc-900/50 border-l-[3px] border-orange-500/60 p-5 rounded-r-2xl border-y border-r border-white/[0.04]">
            <div className="flex items-center justify-between mb-3">
                <label className="text-[12px] font-bold text-zinc-400 flex items-center gap-2">
                    <span className="text-sm opacity-80">🔒</span>
                    <span>학교 전용 메모</span>
                    <span className="font-medium text-zinc-500 text-[10px]">(비공개)</span>
                </label>
                {lastSaved && (
                    <span className="text-[9px] font-bold text-orange-500/80 bg-orange-500/5 px-2 py-0.5 rounded-md border border-orange-500/10 animate-in fade-in slide-in-from-right-1">
                        저장됨: {lastSaved}
                    </span>
                )}
            </div>
            <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                onBlur={handleSave}
                placeholder="지원자에 대한 간단한 평가나 면접 기록을 남기세요. (자동 저장됨)"
                className="w-full h-24 bg-zinc-950/30 border border-white/[0.05] rounded-xl focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500/30 transition-all text-[13px] text-zinc-200 placeholder:text-zinc-600 p-4 resize-none leading-relaxed outline-none"
                disabled={isSaving}
            />
            <div className="flex justify-start mt-2 px-1">
                <p className="text-[10px] text-zinc-600 font-medium flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                    입력 후 포커스를 옮기면 자동 저장됩니다.
                </p>
            </div>
        </div>
    );
};

export default InternalMemo;
