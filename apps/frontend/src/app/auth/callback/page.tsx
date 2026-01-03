"use client";

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function CallbackHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login, user } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            login(token).then(() => {
                // 유저 정보를 가져온 후 역할에 따라 리다이렉트
                // Note: user 상태가 login() 호출 직후 바로 업데이트되지 않을 수 있으므로 
                // AuthContext의 로직에 따라 처리하거나 여기서 다시 체크가 필요할 수 있음
            });
        } else {
            router.push('/');
        }
    }, [searchParams, login, router]);

    useEffect(() => {
        if (user) {
            if (user.role === 'PENDING') {
                router.push('/onboarding/role');
            } else {
                router.push('/dashboard');
            }
        }
    }, [user, router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-foreground-muted animate-pulse">로그인 중입니다...</p>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CallbackHandler />
        </Suspense>
    );
}
