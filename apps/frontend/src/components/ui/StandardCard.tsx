"use client";

import React from 'react';

interface StandardCardProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    icon?: string | React.ReactNode;
    extra?: React.ReactNode;
    className?: string;
    noPadding?: boolean;
}

export default function StandardCard({
    children,
    title,
    subtitle,
    icon,
    extra,
    className = "",
    noPadding = false
}: StandardCardProps) {
    return (
        <div className={`bg-surface border border-border rounded-[32px] overflow-hidden shadow-sm hover:shadow-md transition-all ${className}`}>
            {(title || icon || extra) && (
                <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="flex items-center gap-3">
                        {icon && (
                            <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-border">
                                {typeof icon === 'string' ? <span className="text-xl">{icon}</span> : icon}
                            </div>
                        )}
                        <div>
                            {title && <h3 className="font-bold text-foreground">{title}</h3>}
                            {subtitle && <p className="text-xs text-foreground-muted mt-0.5">{subtitle}</p>}
                        </div>
                    </div>
                    {extra && <div>{extra}</div>}
                </div>
            )}
            <div className={noPadding ? '' : 'p-6 md:p-8'}>
                {children}
            </div>
        </div>
    );
}

export function StandardBadge({
    children,
    variant = 'neutral',
    className = ""
}: {
    children: React.ReactNode,
    variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral' | 'indigo',
    className?: string
}) {
    const variants = {
        primary: 'bg-primary/10 text-primary border-primary/20',
        success: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        error: 'bg-red-500/10 text-red-500 border-red-500/20',
        neutral: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
        indigo: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    };

    return (
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
}
