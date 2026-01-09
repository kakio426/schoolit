"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Review {
    id: number;
    content: string;
    rating: number | null;
    createdAt: string;
    sender: {
        id: number;
        name: string;
        role: string;
        schoolProfile?: { schoolName: string };
    };
    keywords: { keyword: string }[];
    imageUrls?: string[];
}

interface ReviewListModalProps {
    userId: number;
    userName: string;
    onClose: () => void;
}

export default function ReviewListModal({ userId, userName, onClose }: ReviewListModalProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const data = await api.get<Review[]>(`/reviews/received/${userId}`);
                setReviews(data);
            } catch (error) {
                console.error('Failed to fetch reviews:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReviews();
    }, [userId]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            {/* Modal */}
            <div className="relative bg-surface rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">📋 {userName}님의 후기</h2>
                        <p className="text-sm text-foreground-muted mt-1">받은 후기 총 {reviews.length}건</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-surface-hover rounded-full transition-colors text-foreground-muted hover:text-foreground"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-12 text-foreground-muted">
                            <p className="text-4xl mb-2">📭</p>
                            <p>아직 받은 후기가 없습니다.</p>
                        </div>
                    ) : (
                        reviews.map((review) => (
                            <div key={review.id} className="p-4 bg-background/50 rounded-2xl border border-border">
                                {/* Sender & Date */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-foreground">
                                            {review.sender.name}
                                            {review.sender.schoolProfile && (
                                                <span className="text-foreground-muted font-normal ml-1">
                                                    ({review.sender.schoolProfile.schoolName})
                                                </span>
                                            )}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${review.sender.role === 'SCHOOL' ? 'bg-blue-500/20 text-blue-600' :
                                            review.sender.role === 'TEACHER' ? 'bg-green-500/20 text-green-600' :
                                                'bg-orange-500/20 text-orange-600'
                                            }`}>
                                            {review.sender.role}
                                        </span>
                                    </div>
                                    <span className="text-xs text-foreground-muted">
                                        {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                                    </span>
                                </div>

                                {/* Rating (if exists) */}
                                {review.rating && (
                                    <div className="flex items-center gap-1 mb-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <span key={star} className={star <= review.rating! ? 'text-yellow-400' : 'text-slate-300'}>
                                                ★
                                            </span>
                                        ))}
                                        <span className="text-sm text-foreground-muted ml-1">({review.rating}/5)</span>
                                    </div>
                                )}

                                {/* Content */}
                                <p className="text-foreground leading-relaxed mb-3">{review.content || '(내용 없음)'}</p>

                                {/* Images */}
                                {review.imageUrls && review.imageUrls.length > 0 && (
                                    <div className="flex gap-2 overflow-x-auto pb-2 mb-3 no-scrollbar">
                                        {review.imageUrls.map((url, idx) => (
                                            <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 border border-border">
                                                <img src={url} alt={`review-img-${idx}`} className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Keywords */}
                                {review.keywords && review.keywords.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {review.keywords.map((kw, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                                                #{kw.keyword}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
