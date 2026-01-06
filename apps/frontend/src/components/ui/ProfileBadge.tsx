"use client";

import React from 'react';

interface ProfileBadgeProps {
    isVerified: boolean;
}

export default function ProfileBadge({ isVerified }: ProfileBadgeProps) {
    if (isVerified) {
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 shadow-sm">
                <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-green-500 animate-pulse"></span>
                인증됨
            </span>
        );
    }

    return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 shadow-sm">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-500"></span>
            미인증
        </span>
    );
}
