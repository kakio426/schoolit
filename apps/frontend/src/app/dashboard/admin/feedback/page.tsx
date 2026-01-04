"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
// Feedback import removed as it was not used and not exported from @/types
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, MessageSquare, Reply, CheckCircle2, AlertCircle } from 'lucide-react';

interface FeedbackItem {
    id: number;
    category: string;
    content: string;
    reply: string | null;
    status: 'PENDING' | 'ANSWERED';
    createdAt: string;
    user: {
        email: string;
        name: string | null;
    } | null;
}

const CATEGORY_COLORS: Record<string, string> = {
    'PROPOSAL': 'bg-amber-100 text-amber-700 border-amber-200',
    'BUG': 'bg-red-100 text-red-700 border-red-200',
    'PRAISE': 'bg-green-100 text-green-700 border-green-200',
    'INQUIRY': 'bg-blue-100 text-blue-700 border-blue-200',
};

export default function AdminFeedbackPage() {
    const { user } = useAuth();
    const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchFeedbacks = async () => {
        try {
            const res = await api.get<FeedbackItem[]>('/feedback');
            setFeedbacks(res);
        } catch (error) {
            console.error('Failed to fetch feedbacks', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const handleReply = async (id: number) => {
        if (!replyContent.trim()) return;
        setIsSubmitting(true);
        try {
            await api.patch(`/feedback/${id}/reply`, { reply: replyContent });
            setReplyingTo(null);
            setReplyContent('');
            fetchFeedbacks(); // Refresh list
        } catch (error) {
            alert('답변 등록 실패');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">피드백 관리 (관제 센터)</h1>
                    <p className="text-slate-500">유저들의 소중한 의견을 확인하고 답변해주세요. (색깔별로 구분됩니다)</p>
                </div>
            </div>

            <div className="grid gap-4">
                {feedbacks.map((item) => (
                    <div key={item.id} className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border p-6 transition-all ${item.status === 'PENDING' ? 'border-primary/20 ring-1 ring-primary/10' : 'border-slate-200 dark:border-slate-800'
                        }`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${CATEGORY_COLORS[item.category] || 'bg-slate-100 text-slate-600'}`}>
                                    {item.category}
                                </span>
                                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                    {item.user ? `${item.user.name} (${item.user.email})` : '익명 사용자'}
                                </span>
                                <span className="text-xs text-slate-400">
                                    {new Date(item.createdAt).toLocaleString()}
                                </span>
                            </div>
                            <div>
                                {item.status === 'ANSWERED' ? (
                                    <div className="flex items-center gap-1 text-green-600 text-sm font-bold bg-green-50 px-2 py-1 rounded-lg">
                                        <CheckCircle2 size={16} /> 답변 완료
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 text-amber-600 text-sm font-bold bg-amber-50 px-2 py-1 rounded-lg">
                                        <AlertCircle size={16} /> 답변 대기중
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg text-slate-700 dark:text-slate-300 mb-4 whitespace-pre-wrap">
                            {item.content}
                        </div>

                        {item.status === 'ANSWERED' ? (
                            <div className="ml-8 border-l-2 border-primary/20 pl-4 py-2">
                                <p className="text-xs font-bold text-primary mb-1">관리자 답변:</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{item.reply}</p>
                            </div>
                        ) : (
                            <div>
                                {replyingTo === item.id ? (
                                    <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
                                        <textarea
                                            className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-slate-900"
                                            rows={3}
                                            placeholder="답변 내용을 입력하세요..."
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => setReplyingTo(null)}
                                                className="px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100 rounded-lg"
                                            >
                                                취소
                                            </button>
                                            <button
                                                onClick={() => handleReply(item.id)}
                                                disabled={isSubmitting}
                                                className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg flex items-center gap-2 hover:bg-primary-hover disabled:opacity-50"
                                            >
                                                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Reply size={14} />}
                                                답변 등록
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setReplyingTo(item.id);
                                            setReplyContent('');
                                        }}
                                        className="text-sm font-medium text-primary hover:text-primary-hover flex items-center gap-1 group"
                                    >
                                        <Reply size={16} className="group-hover:-scale-x-100 transition-transform" />
                                        답변하기
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {feedbacks.length === 0 && (
                    <div className="text-center py-20 text-slate-400">
                        <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                        <p>등록된 피드백이 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
