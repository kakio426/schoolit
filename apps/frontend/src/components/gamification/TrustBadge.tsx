
import React from 'react';
import { Shield, ShieldCheck, ShieldAlert, Crown } from 'lucide-react';

export type TrustTier = 'NEW' | 'VERIFIED' | 'TRUSTED' | 'TOP_RATED';

interface TrustBadgeProps {
    tier: TrustTier;
    className?: string;
    showLabel?: boolean;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({ tier, className = '', showLabel = false }) => {
    let icon = <Shield className="w-5 h-5 text-slate-400" />;
    let label = '신규 회원';
    let badgeStyle = 'bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400';

    switch (tier) {
        case 'VERIFIED':
            icon = <ShieldCheck className="w-5 h-5 text-primary" />;
            label = '인증 회원';
            badgeStyle = 'bg-primary/10 border-primary/20 text-primary';
            break;
        case 'TRUSTED':
            icon = <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
            label = '신뢰 회원';
            badgeStyle = 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400';
            break;
        case 'TOP_RATED':
            icon = <Crown className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />;
            label = '최우수 회원';
            badgeStyle = 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
            break;
        default:
            // NEW case already set as default
            break;
    }

    if (!showLabel) {
        return <div className={`inline-flex items-center justify-center ${className}`}>{icon}</div>;
    }

    return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold transition-all ${badgeStyle} ${className}`}>
            {icon}
            <span>{label}</span>
        </div>
    );
};
