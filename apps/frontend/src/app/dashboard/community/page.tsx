'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StandardCard from '@/components/ui/StandardCard';
import { api } from '@/lib/api'; // api 유틸리티 사용
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';

// 타입 정의
interface Board {
    id: number;
    title: string;
    category: string;
    description?: string;
    _count?: { posts: number };
}

export default function CommunityDashboard() {
    const router = useRouter();
    const [boards, setBoards] = useState<Board[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 게시판 목록 가져오기
    useEffect(() => {
        const fetchBoards = async () => {
            try {
                // 백엔드 API 호출 (경로 확인 필요: /board 또는 /boards)
                const res = await api.get<Board[]>('/api/boards');
                setBoards(res);
            } catch (err) {
                console.error("Failed to fetch boards:", err);
                setError("게시판 정보를 불러오지 못했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchBoards();
    }, []);

    // 로딩 상태 (스켈레톤 UI)
    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">커뮤니티</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-40 w-full rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 헤더 섹션 */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        커뮤니티 🗣️
                    </h1>
                    <p className="text-slate-500 mt-1">
                        선생님, 학교, 기업들과 자유롭게 소통하세요.
                    </p>
                </div>
                <Button onClick={() => router.push('/dashboard/community/write')}>
                    ✏️ 글쓰기
                </Button>
            </div>

            {/* 에러 발생 시 표시 */}
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
                    ⚠️ {error}
                </div>
            )}

            {/* 게시판 목록 렌더링 */}
            {boards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {boards.map((board) => (
                        <div key={board.id} onClick={() => router.push(`/dashboard/community/posts?boardId=${board.id}`)}>
                            <StandardCard
                                className="group cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg dark:bg-slate-900"
                            >
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl">
                                            {board.category === 'NOTICE' ? '📢' :
                                                board.category === 'QNA' ? '❓' :
                                                    board.category === 'FREE' ? '💬' : '📂'}
                                        </div>
                                        {board._count?.posts !== undefined && (
                                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-md text-xs font-bold text-slate-600 dark:text-slate-300">
                                                {board._count.posts}개 글
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                                            {board.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                                            {board.description || '새로운 소식과 이야기를 나눠보세요.'}
                                        </p>
                                    </div>
                                </div>
                            </StandardCard>
                        </div>
                    ))}
                </div>
            ) : (
                /* 게시판이 하나도 없을 때 (초기 상태) */
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                    <p className="text-xl text-slate-500">생성된 게시판이 없습니다.</p>
                    <p className="text-sm text-slate-400 mb-6">관리자에게 문의해주세요.</p>
                </div>
            )}
        </div>
    );
}
