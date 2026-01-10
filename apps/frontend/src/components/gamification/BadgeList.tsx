
import React from 'react';
import { UserBadge, BadgeType } from '@/types';
import { Zap, Medal, GraduationCap, HeartHandshake, CreditCard, Award } from 'lucide-react';

interface BadgeListProps {
    badges?: UserBadge[];
    className?: string;
}

const BADGE_CONFIG: Record<BadgeType, { icon: React.ReactNode; label: string; color: string }> = {
    FAST_RESPONDER: {
        icon: <Zap className="w-4 h-4" />,
        label: '번개 응답러',
        color: 'bg-yellow-100 text-yellow-600 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
    },
    PROFILE_MASTER: {
        icon: <GraduationCap className="w-4 h-4" />,
        label: '프로필 마스터',
        color: 'bg-green-100 text-green-600 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    },
    VETERAN: {
        icon: <Medal className="w-4 h-4" />,
        label: '베테랑',
        color: 'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    },
    HIGH_RETURN: {
        icon: <HeartHandshake className="w-4 h-4" />,
        label: '재계약 우수',
        color: 'bg-pink-100 text-pink-600 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800',
    },
    GOOD_PAYER: {
        icon: <CreditCard className="w-4 h-4" />,
        label: '결제 우수',
        color: 'bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
    },
    S2B_CERTIFIED: {
        icon: <Award className="w-4 h-4" />,
        label: 'S2B 인증 기업',
        color: 'bg-orange-100 text-orange-600 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
    },
};

export const BadgeList: React.FC<BadgeListProps> = ({ badges = [], className = '' }) => {
    if (badges.length === 0) return null;

    return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
            {badges.map((badge) => {
                const config = BADGE_CONFIG[badge.type];
                if (!config) return null;

                return (
                    <div
                        key={badge.id}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${config.color}`}
                        title={`Joined: ${new Date(badge.earnedAt).toLocaleDateString()}`}
                    >
                        {config.icon}
                        <span>{config.label}</span>
                    </div>
                );
            })}
        </div>
    );
};
