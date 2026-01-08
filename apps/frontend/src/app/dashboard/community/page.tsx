'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { MessageSquare, ThumbsUp, Eye, Plus, Pin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Board {
    id: number;
    title: string;
    description: string | null;
    category: string;
}

interface Post {
    id: number;
    title: string;
    content: string;
    views: number;
    isPinned: boolean;
    createdAt: string;
    author: {
        id: number;
        name: string;
        role: string;
    };
    imageUrls: string[];
    _count: {
        comments: number;
        likes: number;
    };
}

interface PostsResponse {
    posts: Post[];
    total: number;
    page: number;
    totalPages: number;
}

export default function CommunityPage() {
    const { user } = useAuth();
    const [boards, setBoards] = useState<Board[]>([]);
    const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // 게시판 목록 조회
    useEffect(() => {
        const fetchBoards = async () => {
            try {
                const data = await api.get<Board[]>('/api/boards');
                setBoards(data);
                if (data.length > 0) {
                    setSelectedBoard(data[0]);
                } else {
                    setLoading(false); // 데이터가 없으면 로딩 종료
                }
            } catch (error) {
                console.error('Failed to fetch boards:', error);
                setLoading(false); // 에러 발생 시 로딩 종료
            }
        };
        fetchBoards();
    }, []);

    // 게시글 목록 조회
    useEffect(() => {
        if (!selectedBoard) return;

        const fetchPosts = async () => {
            setLoading(true);
            try {
                const data = await api.get<PostsResponse>(
                    `/api/boards/${selectedBoard.id}/posts?page=${page}&limit=20`
                );
                setPosts(data.posts);
                setTotalPages(data.totalPages);
            } catch (error) {
                console.error('Failed to fetch posts:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [selectedBoard, page]);

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            NOTICE: '📢 공지사항',
            FREE: '💬 자유게시판',
            QNA: '❓ Q&A',
            REVIEW_BOARD: '⭐ 후기게시판',
        };
        return labels[category] || category;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours < 24) {
            return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                            <Link href="/dashboard" className="hover:text-white transition">대시보드</Link>
                            <span>/</span>
                            <span className="text-blue-400">커뮤니티</span>
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            커뮤니티
                        </h1>
                        <p className="text-gray-400 mt-1">학교, 선생님, 업체가 함께 소통하는 공간</p>
                    </div>
                    {selectedBoard && (selectedBoard.category !== 'NOTICE' || user?.role === 'ADMIN') && (
                        <Link
                            href={`/dashboard/community/write?boardId=${selectedBoard.id}`}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-medium hover:opacity-90 transition"
                        >
                            <Plus size={18} />
                            글쓰기
                        </Link>
                    )}
                </div>

                <div className="flex gap-6">
                    {/* Sidebar - 게시판 목록 */}
                    <div className="w-64 shrink-0">
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                            <h2 className="text-sm font-semibold text-gray-400 uppercase mb-3">게시판</h2>
                            <nav className="space-y-1">
                                {boards.map((board) => (
                                    <button
                                        key={board.id}
                                        onClick={() => { setSelectedBoard(board); setPage(1); }}
                                        className={`w-full text-left px-3 py-2 rounded-lg transition ${selectedBoard?.id === board.id
                                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                            : 'text-gray-300 hover:bg-gray-700/50'
                                            }`}
                                    >
                                        {getCategoryLabel(board.category)}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content - 게시글 목록 */}
                    <div className="flex-1">
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
                            {/* 게시판 헤더 */}
                            <div className="px-6 py-4 border-b border-gray-700/50">
                                <h2 className="text-xl font-bold">
                                    {selectedBoard ? getCategoryLabel(selectedBoard.category) : '게시판 선택'}
                                </h2>
                                {selectedBoard?.description && (
                                    <p className="text-gray-400 text-sm mt-1">{selectedBoard.description}</p>
                                )}
                            </div>

                            {/* 게시글 리스트 */}
                            {loading ? (
                                <div className="p-8 text-center text-gray-400">
                                    <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
                                    로딩 중...
                                </div>
                            ) : posts.length === 0 ? (
                                <div className="p-12 text-center text-gray-400">
                                    <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>아직 게시글이 없습니다.</p>
                                    <p className="text-sm mt-1">첫 번째 글을 작성해보세요!</p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-gray-700/50">
                                    {posts.map((post) => (
                                        <li key={post.id}>
                                            <Link
                                                href={`/dashboard/community/posts/${post.id}`}
                                                className="block px-6 py-4 hover:bg-gray-700/30 transition"
                                            >
                                                <div className="flex items-start gap-4">
                                                    {/* 썸네일 (있는 경우) */}
                                                    {post.imageUrls.length > 0 && (
                                                        <img
                                                            src={post.imageUrls[0]}
                                                            alt=""
                                                            className="w-16 h-16 object-cover rounded-lg shrink-0"
                                                        />
                                                    )}

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            {post.isPinned && (
                                                                <span className="flex items-center gap-1 text-xs text-yellow-400">
                                                                    <Pin size={12} /> 고정
                                                                </span>
                                                            )}
                                                            <h3 className="font-medium text-white truncate">
                                                                {post.title}
                                                            </h3>
                                                            {post._count.comments > 0 && (
                                                                <span className="text-xs text-blue-400">
                                                                    [{post._count.comments}]
                                                                </span>
                                                            )}
                                                        </div>

                                                        <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                                                            {post.content.replace(/<[^>]*>/g, '')}
                                                        </p>

                                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                            <span>{post.author.name}</span>
                                                            <span>{formatDate(post.createdAt)}</span>
                                                            <span className="flex items-center gap-1">
                                                                <Eye size={12} /> {post.views}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <ThumbsUp size={12} /> {post._count.likes}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center gap-2 p-4 border-t border-gray-700/50">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            className={`w-8 h-8 rounded-lg transition ${page === p
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
