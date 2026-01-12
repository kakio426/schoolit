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
    'PROPOSAL': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    'BUG': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    'PRAISE': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    'INQUIRY': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
};

const getCategoryStyle = (category: string) => {
    if (category.startsWith('REPORT')) {
        return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800';
    }
    return CATEGORY_COLORS[category] || 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
};

import DashboardLayout from '@/components/layout/DashboardLayout';

export default function AdminFeedbackPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchFeedbacks = async () => {
        try {
            const res = await api.get<FeedbackItem[]>('/feedback');
            setFeedbacks(Array.isArray(res) ? res : []);
        } catch (error) {
            console.error('Failed to fetch feedbacks', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'ADMIN') {
            fetchFeedbacks();
        }
    }, [user]);

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

    if (authLoading || (isLoading && user?.role === 'ADMIN')) {
        return (
            <DashboardLayout>
                <div className="flex h-96 items-center justify-center">
                    <Loader2 className="animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    if (user?.role !== 'ADMIN') {
        return (
            <DashboardLayout>
                <div className="text-center py-20">
                    <p className="text-red-500 font-bold">접근 권한이 없습니다.</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">피드백 관리 센터</h1>
                        <p className="text-foreground-muted">사용자들의 소중한 의견을 실시간으로 확인하고 소통하세요.</p>
                    </div>
                </div>

                <div className="grid gap-6">
                    {feedbacks.map((item) => (
                        <div key={item.id} className={`bg-surface rounded-2xl shadow-sm border p-6 transition-all hover:shadow-md ${item.status === 'PENDING' ? 'border-primary/20 ring-1 ring-primary/5' : 'border-slate-200/50 dark:border-slate-700/50'
                            }`}>
                            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getCategoryStyle(item.category)}`}>
                                        {item.category}
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-foreground">
                                            {item.user ? item.user.name : '익명 사용자'}
                                        </span>
                                        <span className="text-xs text-foreground-muted">
                                            {item.user ? item.user.email : '-'}
                                        </span>
                                    </div>
                                    <span className="text-xs text-slate-400 ml-2">
                                        {new Date(item.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <div className="ml-auto">
                                    {item.status === 'ANSWERED' ? (
                                        <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-xs font-bold bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full border border-green-100 dark:border-green-800/50">
                                            <CheckCircle2 size={14} /> 답변 완료
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-bold bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-full border border-amber-100 dark:border-amber-800/50">
                                            <AlertCircle size={14} /> 답변 대기중
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl text-foreground mb-4 whitespace-pre-wrap text-sm leading-relaxed border border-slate-100 dark:border-slate-800">
                                {item.content}
                            </div>

                            {item.status === 'ANSWERED' ? (
                                <div className="ml-6 border-l-2 border-primary/30 pl-6 py-2 bg-primary/5 rounded-r-xl p-4">
                                    <p className="text-xs font-black text-primary uppercase tracking-wider mb-2">관리자 답변</p>
                                    <p className="text-sm text-foreground/80 leading-relaxed">{item.reply}</p>
                                </div>
                            ) : (
                                <div>
                                    {replyingTo === item.id ? (
                                        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
                                            <textarea
                                                className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:outline-none bg-surface dark:bg-slate-900 text-sm"
                                                rows={4}
                                                placeholder="답변 내용을 입력하세요. 등록 시 사용자에게 알림이 발송됩니다."
                                                value={replyContent}
                                                onChange={(e) => setReplyContent(e.target.value)}
                                            />
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setReplyingTo(null)}
                                                    className="px-4 py-2 text-sm text-foreground-muted hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors"
                                                >
                                                    취소
                                                </button>
                                                <button
                                                    onClick={() => handleReply(item.id)}
                                                    disabled={isSubmitting}
                                                    className="px-5 py-2 text-sm bg-primary text-white rounded-xl flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50 font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
                                                >
                                                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Reply size={16} />}
                                                    답변 등록 및 알림 발송
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setReplyingTo(item.id);
                                                setReplyContent('');
                                            }}
                                            className="text-sm font-bold text-primary hover:text-primary/80 flex items-center gap-2 group bg-primary/5 px-4 py-2 rounded-xl transition-all"
                                        >
                                            <Reply size={16} className="group-hover:translate-x-0.5 transition-transform" />
                                            답변하기
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    {feedbacks.length === 0 && (
                        <div className="bg-surface rounded-3xl border border-slate-200/50 dark:border-slate-700 p-20 text-center flex flex-col items-center justify-center animate-in fade-in duration-700">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                                <MessageSquare size={40} className="text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">등록된 피드백이 없습니다</h3>
                            <p className="text-foreground-muted">유저들로부터 도착한 새로운 의견이 아직 없습니다.</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

