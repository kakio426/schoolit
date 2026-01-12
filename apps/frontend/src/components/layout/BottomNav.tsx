"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
    label: string;
    href: string;
    icon: string;
}

interface BottomNavProps {
    items: NavItem[];
    unreadMessageCount?: number;
}

export default function BottomNav({ items, unreadMessageCount = 0 }: BottomNavProps) {
    const pathname = usePathname();

    if (items.length === 0) return null;

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-950/90 backdrop-blur-xl border-t border-slate-200 dark:border-white/[0.08] safe-area-bottom">
            <div className="flex items-center justify-around h-16 px-2">
                {items.map((item) => {
                    const isActive = item.href === '/dashboard'
                        ? pathname === '/dashboard'
                        : pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

                    const isMessages = item.label === '메시지';

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 relative transition-all duration-200 active:scale-95 ${isActive
                                    ? 'text-primary'
                                    : 'text-slate-400 dark:text-zinc-500'
                                }`}
                        >
                            {/* Icon */}
                            <span className={`text-xl transition-transform ${isActive ? 'scale-110' : ''}`}>
                                {item.icon}
                            </span>

                            {/* Label */}
                            <span className={`text-[10px] font-medium transition-colors ${isActive ? 'font-bold' : ''}`}>
                                {item.label}
                            </span>

                            {/* Active Indicator */}
                            {isActive && (
                                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-5 h-1 bg-primary rounded-full" />
                            )}

                            {/* Message Badge */}
                            {isMessages && unreadMessageCount > 0 && (
                                <span className="absolute top-1 right-1/2 translate-x-3 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                                    {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
