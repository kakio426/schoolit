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
        <div className={`bg-surface border border-white/[0.05] rounded-xl overflow-hidden transition-all duration-200 ${className}`}>
            {(title || icon || extra) && (
                <div className="px-5 py-3.5 border-b border-white/[0.05] flex items-center justify-between bg-zinc-900/30">
                    <div className="flex items-center gap-2.5">
                        {icon && (
                            <div className="flex items-center justify-center text-zinc-400">
                                {typeof icon === 'string' ? <span className="text-lg">{icon}</span> : React.cloneElement(icon as React.ReactElement<any>, { size: 18 })}
                            </div>
                        )}
                        <div>
                            {title && <h3 className="font-bold text-sm text-zinc-100">{title}</h3>}
                            {subtitle && <p className="text-[11px] text-zinc-500 mt-0.5">{subtitle}</p>}
                        </div>
                    </div>
                    {extra && <div>{extra}</div>}
                </div>
            )}
            <div className={noPadding ? '' : 'p-5 md:p-6'}>
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
    variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral' | 'indigo' | 'info' | 'default',
    className?: string
}) {
    const variants = {
        primary: 'bg-primary/10 text-primary border-primary/20',
        success: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        error: 'bg-red-500/10 text-red-500 border-red-500/20',
        neutral: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
        indigo: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
        info: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
        default: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    };

    return (
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
}
