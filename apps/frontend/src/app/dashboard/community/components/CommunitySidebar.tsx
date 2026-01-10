"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { MessageSquare, Volume2, HelpCircle, Star, PenTool, ArrowLeft } from "lucide-react";
import StandardCard from "@/components/ui/StandardCard";

const MENU_ITEMS = [
    { label: "공지사항", category: "NOTICE", icon: Volume2 },
    { label: "자유게시판", category: "FREE", icon: MessageSquare },
    { label: "질문/답변", category: "QNA", icon: HelpCircle },
    { label: "후기게시판", category: "REVIEW_BOARD", icon: Star },
];

export default function CommunitySidebar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentCategory = searchParams.get('category');

    const isMainPage = pathname === '/dashboard/community';

    return (
        <aside className="w-full md:w-64 shrink-0 space-y-4">
            {/* 대시보드 복귀 버튼 */}
            <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-500 hover:text-primary transition-colors group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                대시보드로 돌아가기
            </Link>

            <StandardCard className="p-4 border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-2 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <MessageSquare size={18} />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                        커뮤니티
                    </h3>
                </div>

                <nav className="space-y-1.5">
                    <Link
                        href="/dashboard/community"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isMainPage && !currentCategory
                                ? "bg-primary text-white font-semibold shadow-md shadow-primary/20"
                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                            }`}
                    >
                        <PenTool size={18} />
                        <span className="text-sm">전체 게시판</span>
                    </Link>

                    <div className="my-4 border-t border-slate-50 dark:border-slate-800" />

                    {MENU_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentCategory === item.category;

                        return (
                            <Link
                                key={item.label}
                                href={`/dashboard/community?category=${item.category}`}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive
                                        ? "bg-primary/10 text-primary font-bold"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                                    }`}
                            >
                                <Icon size={18} />
                                <span className="text-sm">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </StandardCard>

            {/* 글쓰기 버튼 - 더 강조된 스타일 */}
            <Link
                href="/dashboard/community/write"
                className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
            >
                <span>✏️</span>
                <span>글쓰기</span>
            </Link>
        </aside>
    );
}
