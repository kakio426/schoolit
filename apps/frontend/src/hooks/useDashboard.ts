import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

// 타입 정의
interface DashboardStats {
    activeListings?: number;
    activeJobs?: number;
    pendingApplications?: number;
    unreadMessages?: number;
    unreadNotifications?: number;
}

interface DashboardActivity {
    id: number;
    title: string;
    description?: string;
    createdAt: string;
}

export function useDashboard() {
    const { token } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [activity, setActivity] = useState<DashboardActivity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!token) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const [statsRes, activityRes] = await Promise.all([
                api.get<DashboardStats>('/dashboard/stats'),
                api.get<DashboardActivity[]>('/dashboard/activity')
            ]);
            setStats(statsRes);
            setActivity(activityRes);
        } catch (err: unknown) {
            console.error('Failed to fetch dashboard data', err);
            const errorMessage = err instanceof Error ? err.message : '데이터를 불러오지 못했습니다.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { stats, activity, isLoading, error, refresh: fetchData };
}

