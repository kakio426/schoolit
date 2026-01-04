import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export function useDashboard() {
    const { token } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [activity, setActivity] = useState<any[]>([]);
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
                api.get<any>('/dashboard/stats'),
                api.get<any[]>('/dashboard/activity')
            ]);
            setStats(statsRes);
            setActivity(activityRes);
        } catch (err: any) {
            console.error('Failed to fetch dashboard data', err);
            setError(err.message || '데이터를 불러오지 못했습니다.');
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { stats, activity, isLoading, error, refresh: fetchData };
}
