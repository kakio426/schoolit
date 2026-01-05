import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export function useProfile() {
    const { user, token, refreshProfile } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [certifications, setCertifications] = useState<any[]>([]);
    const [isLoadingCerts, setIsLoadingCerts] = useState(false);

    const fetchCertifications = useCallback(async () => {
        if (!token) return;
        setIsLoadingCerts(true);
        try {
            const data = await api.get<any[]>('/users/certifications');
            setCertifications(data);
        } catch (err) {
            console.error('Failed to fetch certifications', err);
        } finally {
            setIsLoadingCerts(false);
        }
    }, [token]);

    useEffect(() => {
        if (user?.role === 'TEACHER') {
            fetchCertifications();
        }
    }, [user, fetchCertifications]);

    const updateTeacherProfile = async (data: { bio: string; subjects: string[]; regions: string[] }) => {
        setIsSaving(true);
        try {
            await api.patch('/users/profile', data);
            await refreshProfile();
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        } finally {
            setIsSaving(false);
        }
    };

    const updateSchoolProfile = async (data: any) => {
        setIsSaving(true);
        try {
            await api.patch('/users/school/profile', data);
            await refreshProfile();
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        } finally {
            setIsSaving(false);
        }
    };

    return {
        updateTeacherProfile,
        updateSchoolProfile,
        certifications,
        fetchCertifications,
        isSaving,
        isLoadingCerts
    };
}
