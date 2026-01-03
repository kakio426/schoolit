
"use client";

import React, { useState } from 'react';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { content: string; rating?: number; keywords: string[] }) => Promise<void>;
    receiverName: string;
    receiverRole: 'TEACHER' | 'BUSINESS' | 'SCHOOL';
}

const TEACHER_KEYWORDS = [
    "시간 엄수", "전문성 높음", "아이들이 좋아함", "준비물 철저", "커뮤니케이션 원활", "열정적임"
];

export default function ReviewModal({ isOpen, onClose, onSubmit, receiverName, receiverRole }: ReviewModalProps) {
    const [content, setContent] = useState('');
    const [rating, setRating] = useState(5);
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
    const [reMatchIntent, setReMatchIntent] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const toggleKeyword = (kw: string) => {
        if (selectedKeywords.includes(kw)) {
            setSelectedKeywords(prev => prev.filter(k => k !== kw));
        } else {
            setSelectedKeywords(prev => [...prev, kw]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit({
                content,
                rating: receiverRole === 'TEACHER' ? undefined : rating,
                keywords: selectedKeywords,
                reMatchIntent
            });
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-lg mx-4 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">활동 평가 남기기</h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <span className="text-2xl">×</span>
                        </button>
                    </div>

                    <p className="text-slate-600 mb-8">
                        <span className="font-bold text-primary">{receiverName}</span>님과의 활동은 어떠셨나요?
                        정성스러운 후기는 더 좋은 매칭 생태계를 만듭니다.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {receiverRole === 'TEACHER' ? (
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-3">칭찬 키워드 (선택)</label>
                                <div className="flex flex-wrap gap-2">
                                    {TEACHER_KEYWORDS.map(kw => (
                                        <button
                                            key={kw}
                                            type="button"
                                            onClick={() => toggleKeyword(kw)}
                                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${selectedKeywords.includes(kw)
                                                ? 'bg-primary border-primary text-white shadow-md'
                                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                                }`}
                                        >
                                            {kw}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-3">별점</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="text-3xl transition-transform active:scale-90"
                                        >
                                            {star <= rating ? '⭐' : '☆'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">상세 후기</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none text-sm"
                                placeholder="활동에 대한 구체적인 의견을 남겨주세요."
                            />
                        </div>

                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <label className="block text-sm font-bold text-slate-700 mb-3 text-center">선생님과 다시 일하고 싶으신가요?</label>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setReMatchIntent(true)}
                                    className={`flex-1 py-3 rounded-xl font-bold transition-all border ${reMatchIntent
                                            ? 'bg-white border-primary text-primary shadow-sm'
                                            : 'bg-transparent border-transparent text-slate-400 opacity-50'
                                        }`}
                                >
                                    👍 네, 적극 추천해요
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setReMatchIntent(false)}
                                    className={`flex-1 py-3 rounded-xl font-bold transition-all border ${!reMatchIntent
                                            ? 'bg-white border-red-400 text-red-500 shadow-sm'
                                            : 'bg-transparent border-transparent text-slate-400 opacity-50'
                                        }`}
                                >
                                    🤔 잘 모르겠어요
                                </button>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-colors"
                            >
                                취소
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`flex-[2] py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'
                                    }`}
                            >
                                {isSubmitting ? '제출 중...' : '평가 완료하기'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
