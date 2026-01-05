import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export function useProfile() {
    const { user, token, refreshProfile } = useAuth();
    const [isSaving, setIsSaving] = useState(false);


    const updateTeacherProfile = async (data: { bio?: string; subjects?: string[]; regions?: string[]; profileImage?: string; targetGrades?: string[]; transientDocuments?: any; checklist?: any; bankAccount?: string }) => {
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

    const addTeacherExperience = async (data: any) => {
        setIsSaving(true);
        try {
            await api.post('/users/teacher/experience', data);
            await refreshProfile();
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        } finally {
            setIsSaving(false);
        }
    };

    const removeTeacherExperience = async (id: number) => {
        try {
            await api.delete(`/users/teacher/experience/${id}`);
            await refreshProfile();
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const addTeacherEducation = async (data: any) => {
        setIsSaving(true);
        try {
            await api.post('/users/teacher/education', data);
            await refreshProfile();
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        } finally {
            setIsSaving(false);
        }
    };

    const removeTeacherEducation = async (id: number) => {
        try {
            await api.delete(`/users/teacher/education/${id}`);
            await refreshProfile();
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const addTeacherLink = async (data: any) => {
        setIsSaving(true);
        try {
            await api.post('/users/teacher/link', data);
            await refreshProfile();
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        } finally {
            setIsSaving(false);
        }
    };

    const removeTeacherLink = async (id: number) => {
        try {
            await api.delete(`/users/teacher/link/${id}`);
            await refreshProfile();
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const addTeacherLicense = async (data: any) => {
        setIsSaving(true);
        try {
            await api.post('/users/teacher/license', data);
            await refreshProfile();
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        } finally {
            setIsSaving(false);
        }
    };

    const removeTeacherLicense = async (id: number) => {
        try {
            await api.delete(`/users/teacher/license/${id}`);
            await refreshProfile();
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    return {
        updateTeacherProfile,
        updateSchoolProfile,
        addTeacherExperience,
        removeTeacherExperience,
        addTeacherEducation,
        removeTeacherEducation,
        addTeacherLink,
        removeTeacherLink,
        addTeacherLicense,
        removeTeacherLicense,
        isSaving,
    };
}
