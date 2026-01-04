import React from 'react';

interface AdminStatsCardProps {
    title: string;
    value: string | number;
    icon: string;
    description: string;
}

export const AdminStatsCard: React.FC<AdminStatsCardProps> = ({ title, value, icon, description }) => {
    return (
        <div className="bg-surface p-6 rounded-[24px] border border-slate-200/50 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl">
                    {icon}
                </div>
                <span className="text-xs font-bold text-primary bg-primary/5 px-2 py-1 rounded-lg">+2.5%</span>
            </div>
            <h3 className="text-foreground-muted text-sm font-semibold mb-1">{title}</h3>
            <p className="text-3xl font-black text-foreground tracking-tight">{value}</p>
            <p className="text-xs text-foreground-muted mt-2">{description}</p>
        </div>
    );
}
