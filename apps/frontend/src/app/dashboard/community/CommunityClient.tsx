'use client';

import { useRouter } from 'next/navigation';
import StandardCard from '@/components/ui/StandardCard';

// 타입 정의
interface Board {
    id: number;
    title: string;
    category: string;
    description?: string;
    _count?: { posts: number };
}

interface CommunityClientProps {
    boards: Board[];
}

export default function CommunityClient({ boards }: CommunityClientProps) {
    const router = useRouter();

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    전체 게시판
                </h1>
                <p className="text-slate-500 mt-1">
                    카테고리를 선택하거나 게시판을 클릭하세요.
                </p>
            </div>

            {/* 게시판 목록 렌더링 */}
            {boards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {boards.map((board) => (
                        <div
                            key={board.id}
                            onClick={() => router.push(`/dashboard/community/posts?boardId=${board.id}`)}
                            className="cursor-pointer"
                        >
                            <StandardCard className="group hover:border-primary/50 transition-all hover:shadow-lg dark:bg-slate-900">
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl">
                                            {board.category === 'NOTICE' ? '📢' :
                                                board.category === 'QNA' ? '❓' :
                                                    board.category === 'FREE' ? '💬' :
                                                        board.category === 'REVIEW_BOARD' ? '⭐' : '📂'}
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
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                    <p className="text-xl text-slate-500">생성된 게시판이 없습니다.</p>
                    <p className="text-sm text-slate-400 mb-6">관리자에게 문의해주세요.</p>
                </div>
            )}
        </div>
    );
}
