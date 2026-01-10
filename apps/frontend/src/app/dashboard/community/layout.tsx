import React, { Suspense } from "react";
import CommunitySidebar from "./components/CommunitySidebar";

// Sidebar를 Suspense로 감싸서 searchParams 사용 시 발생하는 경고 방지
function SidebarWrapper() {
    return (
        <Suspense fallback={<div className="w-64 h-96 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />}>
            <CommunitySidebar />
        </Suspense>
    );
}

export default function CommunityLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto w-full">
            {/* 왼쪽: 고정된 사이드바 */}
            <SidebarWrapper />

            {/* 오른쪽: 바뀌는 컨텐츠 (목록, 글쓰기, 상세페이지 등) */}
            <main className="flex-1 min-w-0">
                {children}
            </main>
        </div>
    );
}
