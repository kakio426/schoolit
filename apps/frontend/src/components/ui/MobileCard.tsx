import React from 'react';
import { ArrowRight } from 'lucide-react';

interface MobileCardProps {
    title: string;
    subtitle?: string;
    description?: string;
    badge?: string;
    badgeColor?: 'blue' | 'green' | 'red' | 'yellow' | 'gray';
    imageUrl?: string;
    rightElement?: React.ReactNode;
    onClick?: () => void;
    children?: React.ReactNode;
}

export default function MobileCard({
    title,
    subtitle,
    description,
    badge,
    badgeColor = 'blue',
    imageUrl,
    rightElement,
    onClick,
    children
}: MobileCardProps) {
    const badgeColors = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        red: 'bg-red-50 text-red-600',
        yellow: 'bg-yellow-50 text-yellow-600',
        gray: 'bg-slate-50 text-slate-600',
    };

    return (
        <div
            onClick={onClick}
            className={`
                group relative bg-white dark:bg-zinc-900 
                rounded-2xl p-5 
                border-2 border-slate-100 dark:border-white/[0.05] 
                active:scale-[0.98] transition-all duration-200
                shadow-sm
                ${onClick ? 'cursor-pointer active:bg-slate-50 dark:active:bg-zinc-800' : ''}
            `}
        >
            <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                    {/* Header: Badge & Right Element */}
                    <div className="flex items-center justify-between mb-2">
                        {badge && (
                            <span className={`
                                inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold 
                                ${badgeColors[badgeColor]}
                            `}>
                                {badge}
                            </span>
                        )}
                        {rightElement}
                    </div>

                    {/* Title Area */}
                    <div className="flex items-start gap-3">
                        {imageUrl && (
                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
                                <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white leading-tight mb-1">
                                {title}
                            </h3>
                            {subtitle && (
                                <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    {description && (
                        <p className="mt-3 text-sm text-slate-600 dark:text-zinc-400 line-clamp-2">
                            {description}
                        </p>
                    )}
                </div>

                {/* Chevron for clickable cards */}
                {onClick && !rightElement && (
                    <ArrowRight className="w-5 h-5 text-slate-300 dark:text-zinc-600 group-hover:text-primary transition-colors" />
                )}
            </div>

            {/* Custom Content Slot */}
            {children && (
                <div className="mt-4 pt-4 border-t border-slate-50 dark:border-white/[0.05]">
                    {children}
                </div>
            )}
        </div>
    );
}
