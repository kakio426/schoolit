"use client";

import React from 'react';

interface ProfileBadgeProps {
    isVerified: boolean;
}

export default function ProfileBadge({ isVerified }: ProfileBadgeProps) {
    if (isVerified) {
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-green-400"></span>
                인증됨
            </span>
        );
    }

    return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-400"></span>
            미인증
        </span>
    );
}
