"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface TeacherProfile {
    bio?: string;
    subjects?: string[];
    regions?: string[];
    isVerified: boolean;
}

interface User {
    id: string;
    email: string;
    name: string;
    role: 'SCHOOL' | 'TEACHER' | 'BUSINESS' | 'ADMIN' | 'PENDING';
    teacherProfile?: TeacherProfile;
    reviewStats?: {
        totalReviews: number;
        averageRating: number;
        topKeywords: Array<{ keyword: string; count: number }>;
        reMatchRate: number;
        isVeteran: boolean;
    };
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (token: string) => Promise<void>;
    logout: () => void;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem('accessToken');
        if (savedToken) {
            setToken(savedToken);
            fetchProfile(savedToken);
        } else {
            setIsLoading(false);
        }
    }, []);

    const fetchProfile = async (authToken: string) => {
        try {
            // Updated to /api/users/profile to get full data
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/users/profile`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            } else {
                logout();
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            logout();
        } finally {
            setIsLoading(false);
        }
    };

    const refreshProfile = async () => {
        if (token) {
            await fetchProfile(token);
        }
    };

    const login = async (newToken: string) => {
        localStorage.setItem('accessToken', newToken);
        setToken(newToken);
        await fetchProfile(newToken);
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        setToken(null);
        setUser(null);
        setIsLoading(false);
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
