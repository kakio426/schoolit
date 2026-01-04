"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Lightbulb, Bug, Heart, HelpCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CATEGORIES = [
    { id: 'PROPOSAL', label: '제안하기', icon: Lightbulb, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    { id: 'BUG', label: '불편/버그', icon: Bug, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
    { id: 'PRAISE', label: '칭찬/응원', icon: Heart, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
    { id: 'INQUIRY', label: '일반 문의', icon: HelpCircle, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
];

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('PROPOSAL');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async () => {
        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            await api.post('/feedback', {
                category: selectedCategory,
                content: content
            });
            setIsSuccess(true);
            setTimeout(() => {
                onClose();
                setIsSuccess(false);
                setContent('');
                setSelectedCategory('PROPOSAL');
            }, 2000);
        } catch (error) {
            console.error('Feedback failed:', error);
            alert('의견 전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">소중한 의견 보내기</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {isSuccess ? (
                        <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-in fade-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-500 mb-2">
                                <Send size={32} />
                            </div>
                            <h4 className="text-xl font-bold text-slate-800 dark:text-white">전송 완료!</h4>
                            <p className="text-slate-500 text-center">
                                소중한 의견 감사합니다.<br />운영진이 꼼꼼히 확인하겠습니다.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Category Selection */}
                            <div className="grid grid-cols-2 gap-3">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left ${selectedCategory === cat.id
                                                ? `border-${cat.color.split('-')[1]} ring-1 ring-${cat.color.split('-')[1]} ${cat.bg}`
                                                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        <cat.icon size={20} className={cat.color} />
                                        <span className={`text-sm font-medium ${selectedCategory === cat.id ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                            {cat.label}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Content Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">내용</label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="자유롭게 의견을 남겨주세요. (구체적일수록 좋아요!)"
                                    className="w-full h-32 p-4 rounded-xl resize-none bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary focus:outline-none transition-all placeholder:text-slate-400 text-slate-800 dark:text-slate-200"
                                ></textarea>
                            </div>

                            {/* Action Buttons */}
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !content.trim()}
                                className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-hover active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        전송 중...
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        의견 보내기
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
