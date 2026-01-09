"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import { Trash2, Search } from 'lucide-react';

interface Review {
    id: number;
    sender: { id: number; name: string; email: string };
    receiver: { id: number; name: string; email: string };
    rating: number | null;
    content: string | null;
    reMatchIntent: boolean;
    keywords: { keyword: string }[];
    imageUrls?: string[];
    createdAt: string;
}

export default function AdminReviewsPage() {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const data = await api.get<{ data: Review[], total: number }>(`/admin/reviews?page=${page}&limit=20&search=${search}`);
            setReviews(data.data);
            setTotalPages(Math.ceil(data.total / 20));
        } catch (error) {
            console.error('Failed to fetch reviews', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'ADMIN') {
            const timeout = setTimeout(fetchReviews, 300);
            return () => clearTimeout(timeout);
        }
    }, [page, search, user]);

    const handleDelete = async (reviewId: number) => {
        if (!confirm('이 리뷰를 삭제하시겠습니까?')) return;

        try {
            await api.delete(`/admin/reviews/${reviewId}`);
            fetchReviews();
        } catch (error) {
            alert('삭제 실패');
        }
    };

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
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">리뷰 관리</h1>
                    <p className="text-foreground-muted">부적절한 리뷰를 모니터링하고 관리하세요.</p>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted" size={20} />
                    <input
                        type="text"
                        placeholder="작성자, 수신자, 내용 검색..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-surface rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 ring-primary/20 transition-all text-foreground"
                    />
                </div>

                {/* Reviews List */}
                <div className="bg-surface rounded-3xl border border-slate-200/50 dark:border-slate-700 shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="p-20 text-center text-foreground-muted">로딩 중...</div>
                    ) : reviews.length === 0 ? (
                        <div className="p-20 text-center text-foreground-muted">
                            <div className="text-5xl mb-4">📝</div>
                            <p className="text-lg font-medium">리뷰가 없습니다.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {reviews.map((review) => (
                                <div key={review.id} className="p-6 hover:bg-surface-hover transition-colors">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            {/* Sender & Receiver */}
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                                                        {review.sender.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-sm text-foreground">{review.sender.name}</div>
                                                        <div className="text-xs text-foreground-muted">{review.sender.email}</div>
                                                    </div>
                                                </div>
                                                <span className="text-foreground-muted">→</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-xs font-bold text-orange-600 dark:text-orange-400">
                                                        {review.receiver.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-sm text-foreground">{review.receiver.name}</div>
                                                        <div className="text-xs text-foreground-muted">{review.receiver.email}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Rating */}
                                            {review.rating && (
                                                <div className="flex items-center gap-1 mb-2">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} className={i < review.rating! ? 'text-yellow-500' : 'text-slate-300'}>
                                                            ★
                                                        </span>
                                                    ))}
                                                    <span className="text-sm text-foreground-muted ml-2">{review.rating}/5</span>
                                                </div>
                                            )}

                                            {/* Content */}
                                            {review.content && (
                                                <p className="text-foreground mb-3 whitespace-pre-wrap">{review.content}</p>
                                            )}

                                            {/* Images */}
                                            {review.imageUrls && review.imageUrls.length > 0 && (
                                                <div className="flex gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar">
                                                    {review.imageUrls.map((url, idx) => (
                                                        <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-slate-100 dark:border-slate-800 shadow-sm">
                                                            <img src={url} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Keywords */}
                                            {review.keywords.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {review.keywords.map((kw, idx) => (
                                                        <span key={idx} className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg">
                                                            {kw.keyword}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Re-match Intent */}
                                            {review.reMatchIntent && (
                                                <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold rounded-lg">
                                                    ✓ 다시 일하고 싶어요
                                                </div>
                                            )}

                                            {/* Date */}
                                            <div className="text-xs text-foreground-muted mt-2">
                                                {new Date(review.createdAt).toLocaleString()}
                                            </div>
                                        </div>

                                        {/* Delete Button */}
                                        <button
                                            onClick={() => handleDelete(review.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="리뷰 삭제"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-4 py-2 rounded-lg bg-surface border border-slate-200 dark:border-slate-700 disabled:opacity-50 hover:bg-surface-hover transition-colors"
                        >
                            이전
                        </button>
                        <span className="px-4 py-2 text-foreground font-medium">{page} / {totalPages}</span>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-4 py-2 rounded-lg bg-surface border border-slate-200 dark:border-slate-700 disabled:opacity-50 hover:bg-surface-hover transition-colors"
                        >
                            다음
                        </button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
