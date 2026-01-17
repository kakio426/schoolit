import React, { Suspense } from 'react';
import { cookies } from 'next/headers';
import { Skeleton } from '@/components/ui/Skeleton';
import CommunityClient from './CommunityClient';

// 타입 정의
interface Board {
    id: number;
    title: string;
    category: string;
    description?: string;
    _count?: { posts: number };
}

// 서버에서 게시판 목록 가져오기 (Server-side Fetch)
async function getBoards(): Promise<Board[]> {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) return [];

    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://schoolit.shop';
        const res = await fetch(`${apiUrl}/api/boards`, {
            headers: { 'Authorization': `Bearer ${token}` },
            cache: 'no-store',
        });

        if (!res.ok) return [];
        return res.json();
    } catch (e) {
        console.error('Failed to fetch boards:', e);
        return [];
    }
}

// 스켈레톤 UI
function BoardsSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-40 w-full rounded-2xl" />
                ))}
            </div>
        </div>
    );
}

// Async Server Component로 게시판 로드
async function BoardsLoader() {
    const boards = await getBoards();
    return <CommunityClient boards={boards} />;
}

// Page Component (Server Component)
// 레이아웃이 사이드바를 관리하므로 여기선 컨텐츠만 렌더링
export default function CommunityPage() {
    return (
        <Suspense fallback={<BoardsSkeleton />}>
            <BoardsLoader />
        </Suspense>
    );
}
