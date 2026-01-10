'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import StandardCard from '@/components/ui/StandardCard';
import { MessageSquare, LayoutGrid, ChevronRight } from 'lucide-react';

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
    const searchParams = useSearchParams();
    const categoryFilter = searchParams.get('category');

    // 필터링된 게시판 목록
    const filteredBoards = categoryFilter
        ? boards.filter(b => b.category === categoryFilter)
        : boards;

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'NOTICE': return '📢';
            case 'QNA': return '❓';
            case 'FREE': return '💬';
            case 'REVIEW_BOARD': return '⭐';
            default: return '📂';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 헤더 섹션 */}
            <div className="bg-gradient-to-r from-primary to-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-primary/10 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2 text-blue-100 font-medium">
                        <LayoutGrid size={16} />
                        <span className="text-sm uppercase tracking-wider">Community Hub</span>
                    </div>
                    <h1 className="text-3xl font-bold">
                        {categoryFilter ? (
                            <span>{categoryFilter === 'NOTICE' ? '공지사항' :
                                categoryFilter === 'FREE' ? '자유게시판' :
                                    categoryFilter === 'QNA' ? '질문/답변' :
                                        categoryFilter === 'REVIEW_BOARD' ? '후기게시판' : '게시판'}</span>
                        ) : '전체 게시판'}
                    </h1>
                    <p className="text-blue-100 mt-2 max-w-lg">
                        {categoryFilter
                            ? `${categoryFilter} 관련 소식과 유용한 정보를 확인하세요.`
                            : '선생님과 학교, 기업이 함께 만드는 스쿨잇 커뮤니티입니다.'}
                    </p>
                </div>

                {/* 장식용 아이콘 */}
                <div className="absolute top-1/2 -right-10 -translate-y-1/2 opacity-10 pointer-events-none">
                    <MessageSquare size={200} />
                </div>
            </div>

            {/* 게시판 목록 */}
            {filteredBoards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredBoards.map((board) => (
                        <div
                            key={board.id}
                            onClick={() => router.push(`/dashboard/community/posts?boardId=${board.id}`)}
                            className="group cursor-pointer"
                        >
                            <StandardCard className="h-full border-slate-100 dark:border-slate-800 hover:border-primary/30 hover:shadow-xl transition-all duration-300 dark:bg-slate-900 group-hover:-translate-y-1">
                                <div className="p-6 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm border border-slate-100/50 dark:border-slate-700/50">
                                            {getCategoryIcon(board.category)}
                                        </div>
                                        {board._count?.posts !== undefined && (
                                            <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold">
                                                {board._count.posts} Posts
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors flex items-center gap-2">
                                            {board.title}
                                            <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-primary" />
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                                            {board.description || '구성원들과 새로운 소식과 이야기를 실시간으로 나눠보세요.'}
                                        </p>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800/50 flex items-center text-xs text-slate-400 font-medium">
                                        <span>커뮤니티 활동 참여하기</span>
                                        <span className="ml-auto text-primary group-hover:underline">입장하기 →</span>
                                    </div>
                                </div>
                            </StandardCard>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 bg-slate-50 dark:bg-slate-800/30 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700/50">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-4xl mb-6 grayscale opacity-50">
                        📂
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">생성된 게시판이 없습니다</h3>
                    <p className="text-slate-500 mt-2 mb-8">관리자가 게시판을 생성하면 여기에 표시됩니다.</p>
                </div>
            )}
        </div>
    );
}
