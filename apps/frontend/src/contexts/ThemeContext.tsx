"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    // 1. Force 'dark' as initial state
    const [theme, setThemeState] = useState<Theme>('dark');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // 2. Ignore localStorage and system settings, force dark mode on mount
        setThemeState('dark');
        applyTheme('dark');
    }, []);

    const applyTheme = (newTheme: Theme) => {
        const root = window.document.documentElement;

        // 3. Force dark mode logic
        const isDark = true;

        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        root.style.colorScheme = 'dark';
    };

    const setTheme = (newTheme: Theme) => {
        // Prevent theme changes, or always set to dark
        setThemeState('dark');
        localStorage.setItem('theme', 'dark');
        applyTheme('dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
