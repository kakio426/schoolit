"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProfileBadge from '@/components/ui/ProfileBadge';
import BusinessProfileForm from '@/components/profile/BusinessProfileForm';
import BusinessPortfolioManager from '@/components/profile/BusinessPortfolioManager';

import SchoolProfileForm from '@/components/profile/SchoolProfileForm';
import TeacherProfileForm from '@/components/profile/TeacherProfileForm';

export default function ProfilePage() {
    const { user, token, refreshProfile } = useAuth();


    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const isBusiness = user?.role === 'BUSINESS';
    const isSchool = user?.role === 'SCHOOL';

    useEffect(() => {
        // Init logic moved to child components
    }, [user]);



    if (!user) return null;

    const isVerified = isBusiness
        ? user.businessProfile?.isVerified
        : isSchool
            ? false // School verification logic later
            : user.teacherProfile?.isVerified;

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">프로필 관리</h1>
                        <p className="text-foreground-muted text-sm mt-1">나의 정보와 자격을 관리하세요.</p>
                    </div>
                    <ProfileBadge isVerified={isVerified || false} />
                </div>

                {isBusiness ? (
                    <>
                        <BusinessProfileForm user={user} token={token} onRefresh={refreshProfile} />
                        <BusinessPortfolioManager portfolios={user.businessProfile?.portfolios || []} token={token} onRefresh={refreshProfile} />
                    </>
                ) : isSchool ? (
                    <SchoolProfileForm user={user} token={token} onRefresh={refreshProfile} />
                ) : (
                    <TeacherProfileForm user={user} token={token} onRefresh={refreshProfile} />
                )}


            </div>
        </DashboardLayout>
    );
}
