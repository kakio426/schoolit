"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { MessageSquare, Volume2, HelpCircle, Star, PenTool } from "lucide-react";
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

    // 커뮤니티 메인 페이지인지 확인
    const isMainPage = pathname === '/dashboard/community';

    return (
        <aside className="w-full md:w-64 shrink-0 space-y-4">
            <StandardCard className="p-4">
                <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white px-2">
                    커뮤니티 🗣️
                </h3>
                <nav className="space-y-1">
                    {/* 전체 보기 */}
                    <Link
                        href="/dashboard/community"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isMainPage && !currentCategory
                                ? "bg-primary/10 text-primary font-semibold"
                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                            }`}
                    >
                        <PenTool size={18} />
                        <span>전체 게시판</span>
                    </Link>

                    {MENU_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentCategory === item.category;

                        return (
                            <Link
                                key={item.label}
                                href={`/dashboard/community?category=${item.category}`}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive
                                        ? "bg-primary/10 text-primary font-semibold"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                                    }`}
                            >
                                <Icon size={18} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </StandardCard>

            {/* 글쓰기 버튼 */}
            <Link
                href="/dashboard/community/write"
                className="flex items-center justify-center w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
                ✏️ 글쓰기
            </Link>
        </aside>
    );
}
