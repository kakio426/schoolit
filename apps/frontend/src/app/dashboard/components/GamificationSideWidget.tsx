
"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CompletenessWidget } from '@/components/gamification/CompletenessWidget';

export default function GamificationSideWidget() {
    const { user } = useAuth();

    // Only show if user exists and completeness data is available
    if (!user || !user.profileCompleteness) return null;

    // Don't show if 100% complete (optional, or show minimized version)
    // For now, let's keep it visible as it might change dynamic messages or show "Master" badge
    if (user.profileCompleteness.percentage === 100) return null;

    return (
        <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground mb-4">
                나의 신뢰도 관리
            </h2>
            <CompletenessWidget completeness={user.profileCompleteness} />
        </div>
    );
}
