'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, ThumbsUp, MessageSquare, Share2, Eye, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Author {
    id: number;
    name: string;
    role: string;
}

interface Comment {
    id: number;
    content: string;
    createdAt: string;
    author: Author;
    replies: Comment[];
}

interface Post {
    id: number;
    title: string;
    content: string;
    views: number;
    isPinned: boolean;
    createdAt: string;
    author: Author;
    imageUrls: string[];
    board: {
        id: number;
        title: string;
        category: string;
    };
    comments: Comment[];
    _count: {
        likes: number;
    };
}

export default function PostDetailPage() {
    const { user } = useAuth();
    const params = useParams();
    const router = useRouter();
    const postId = params?.id as string;

    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!postId) return;

        const fetchPost = async () => {
            try {
                const data = await api.get<Post>(`/api/boards/posts/${postId}`);
                setPost(data);
                setLikeCount(data._count.likes);

                // 좋아요 상태 확인
                const likeStatus = await api.get<{ hasLiked: boolean; count: number }>(
                    `/api/boards/posts/${postId}/like`
                );
                setLiked(likeStatus.hasLiked);
            } catch (error) {
                console.error('Failed to fetch post:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [postId]);

    const handleLike = async () => {
        if (!postId) return;
        try {
            const result = await api.post<{ liked: boolean }>(`/api/boards/posts/${postId}/like`);
            setLiked(result.liked);
            setLikeCount(prev => result.liked ? prev + 1 : prev - 1);
        } catch (error) {
            console.error('Failed to toggle like:', error);
        }
    };

    const handleDelete = async () => {
        if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) return;
        try {
            await api.delete(`/api/boards/posts/${postId}`);
            router.push('/dashboard/community');
        } catch (error: any) {
            alert(error.message || '게시글 삭제에 실패했습니다.');
        }
    };

    const handleCommentDelete = async (commentId: number) => {
        if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) return;
        try {
            await api.delete(`/api/boards/comments/${commentId}`);
            // 게시글 다시 불러오기
            const data = await api.get<Post>(`/api/boards/posts/${postId}`);
            setPost(data);
        } catch (error: any) {
            alert(error.message || '댓글 삭제에 실패했습니다.');
        }
    };

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !postId) return;

        setSubmitting(true);
        try {
            await api.post(`/api/boards/posts/${postId}/comments`, { content: newComment });

            // 게시글 다시 불러오기
            const data = await api.get<Post>(`/api/boards/posts/${postId}`);
            setPost(data);
            setNewComment('');
        } catch (error) {
            console.error('Failed to post comment:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl">게시글을 찾을 수 없습니다.</p>
                    <Link href="/dashboard/community" className="text-blue-400 mt-4 inline-block">
                        ← 목록으로 돌아가기
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <Link
                    href="/dashboard/community"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition"
                >
                    <ArrowLeft size={18} />
                    목록으로
                </Link>

                {/* Post Content */}
                <article className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
                    {/* Header */}
                    <header className="px-6 py-4 border-b border-gray-700/50">
                        <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                                <div className="text-sm text-blue-400 mb-2">{post.board.title}</div>
                                <h1 className="text-2xl font-bold truncate">{post.title}</h1>
                                <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                                    <span className="font-medium text-white">{post.author.name}</span>
                                    <span>{formatDate(post.createdAt)}</span>
                                    <span className="flex items-center gap-1">
                                        <Eye size={14} /> {post.views}
                                    </span>
                                </div>
                            </div>
                            {(user?.id === post.author.id || user?.role === 'ADMIN') && (
                                <div className="flex items-center gap-2">
                                    {(user?.id === post.author.id || user?.role === 'ADMIN') && (
                                        <button className="p-2 text-gray-400 hover:text-white transition rounded-lg hover:bg-gray-700">
                                            <Edit size={18} />
                                        </button>
                                    )}
                                    <button
                                        onClick={handleDelete}
                                        className="p-2 text-gray-400 hover:text-red-400 transition rounded-lg hover:bg-gray-700"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </header>

                    {/* Body */}
                    <div className="px-6 py-6">
                        {/* Images */}
                        {post.imageUrls.length > 0 && (
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                {post.imageUrls.map((url, i) => (
                                    <img
                                        key={i}
                                        src={url}
                                        alt={`이미지 ${i + 1}`}
                                        className="rounded-lg w-full object-cover max-h-80"
                                    />
                                ))}
                            </div>
                        )}

                        {/* Content */}
                        <div className="prose prose-invert max-w-none whitespace-pre-wrap">
                            {post.content}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="px-6 py-4 border-t border-gray-700/50 flex items-center gap-4">
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${liked
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
                                }`}
                        >
                            <ThumbsUp size={18} fill={liked ? 'currentColor' : 'none'} />
                            좋아요 {likeCount}
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 transition">
                            <Share2 size={18} />
                            공유
                        </button>
                    </div>
                </article>

                {/* Comments Section */}
                <section className="mt-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-700/50">
                        <h2 className="font-bold flex items-center gap-2">
                            <MessageSquare size={18} />
                            댓글 {post.comments.length}개
                        </h2>
                    </div>

                    {/* Comment Form */}
                    <form onSubmit={handleComment} className="px-6 py-4 border-b border-gray-700/50">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="댓글을 입력하세요..."
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500"
                            rows={3}
                        />
                        <div className="flex justify-end mt-2">
                            <button
                                type="submit"
                                disabled={submitting || !newComment.trim()}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                {submitting ? '등록 중...' : '댓글 등록'}
                            </button>
                        </div>
                    </form>

                    {/* Comment List */}
                    <ul className="divide-y divide-gray-700/50">
                        {post.comments.map((comment) => (
                            <li key={comment.id} className="px-6 py-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold">
                                        {comment.author.name[0]}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{comment.author.name}</span>
                                                <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                                            </div>
                                            {(user?.id === comment.author.id || user?.role === 'ADMIN') && (
                                                <button
                                                    onClick={() => handleCommentDelete(comment.id)}
                                                    className="p-1 text-gray-500 hover:text-red-400 transition"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <p className="mt-1 text-gray-300">{comment.content}</p>

                                        {/* Replies */}
                                        {comment.replies.length > 0 && (
                                            <ul className="mt-3 space-y-3 pl-4 border-l-2 border-gray-700">
                                                {comment.replies.map((reply) => (
                                                    <li key={reply.id}>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium text-sm">{reply.author.name}</span>
                                                                <span className="text-xs text-gray-500">{formatDate(reply.createdAt)}</span>
                                                            </div>
                                                            {(user?.id === reply.author.id || user?.role === 'ADMIN') && (
                                                                <button
                                                                    onClick={() => handleCommentDelete(reply.id)}
                                                                    className="p-1 text-gray-500 hover:text-red-400 transition"
                                                                >
                                                                    <Trash2 size={12} />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <p className="mt-1 text-sm text-gray-400">{reply.content}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}

                        {post.comments.length === 0 && (
                            <li className="px-6 py-8 text-center text-gray-400">
                                아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!
                            </li>
                        )}
                    </ul>
                </section>
            </div>
        </div>
    );
}
