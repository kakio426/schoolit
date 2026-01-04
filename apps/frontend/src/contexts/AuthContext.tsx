"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { User } from '@/types';

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
            fetchProfile();
        } else {
            setIsLoading(false);
        }
    }, []);

    const fetchProfile = async () => {
        try {
            const userData = await api.get<User>('/users/profile');
            setUser(userData);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            logout();
        } finally {
            setIsLoading(false);
        }
    };

    const refreshProfile = async () => {
        if (localStorage.getItem('accessToken')) {
            await fetchProfile();
        }
    };

    const login = async (newToken: string) => {
        localStorage.setItem('accessToken', newToken);
        setToken(newToken);
        await fetchProfile();
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
