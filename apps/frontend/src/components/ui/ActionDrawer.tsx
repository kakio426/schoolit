'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ActionDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    className?: string;
}

/**
 * ActionDrawer - Mobile-first bottom sheet drawer for actions
 * Slides up from bottom on mobile, modal on desktop
 */
export default function ActionDrawer({
    isOpen,
    onClose,
    title,
    children,
    className = '',
}: ActionDrawerProps) {
    const drawerRef = useRef<HTMLDivElement>(null);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    // Focus trap (basic)
    useEffect(() => {
        if (isOpen && drawerRef.current) {
            drawerRef.current.focus();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 animate-in fade-in duration-200">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Drawer Container */}
            <div
                ref={drawerRef}
                tabIndex={-1}
                className={`
                    absolute bottom-0 left-0 right-0 
                    md:relative md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
                    md:max-w-lg md:w-full md:mx-auto
                    bg-surface rounded-t-[32px] md:rounded-[32px] 
                    shadow-2xl border border-border
                    animate-in slide-in-from-bottom duration-300
                    md:animate-in md:zoom-in-95 md:duration-200
                    max-h-[90vh] overflow-hidden flex flex-col
                    safe-area-bottom
                    ${className}
                `}
            >
                {/* Drag Handle (Mobile) */}
                <div className="flex justify-center pt-3 pb-1 md:hidden">
                    <div className="w-10 h-1 bg-border rounded-full" />
                </div>

                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                        <h3 className="text-lg font-bold text-foreground">{title}</h3>
                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 hover:bg-surface-hover rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-foreground-muted" />
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

/**
 * ActionDrawerItem - Standard action item for use inside ActionDrawer
 */
export function ActionDrawerItem({
    icon,
    label,
    description,
    onClick,
    variant = 'default',
    disabled = false,
}: {
    icon?: React.ReactNode;
    label: string;
    description?: string;
    onClick?: () => void;
    variant?: 'default' | 'primary' | 'danger';
    disabled?: boolean;
}) {
    const variants = {
        default: 'hover:bg-surface-hover text-foreground',
        primary: 'hover:bg-primary/10 text-primary',
        danger: 'hover:bg-red-500/10 text-red-500',
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                w-full flex items-center gap-4 p-4 rounded-2xl transition-colors text-left
                ${variants[variant]}
                ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
            `}
        >
            {icon && (
                <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center
                    ${variant === 'primary' ? 'bg-primary/10' : variant === 'danger' ? 'bg-red-500/10' : 'bg-surface-hover'}
                `}>
                    {icon}
                </div>
            )}
            <div className="flex-1">
                <div className="font-bold">{label}</div>
                {description && (
                    <div className="text-sm text-foreground-muted">{description}</div>
                )}
            </div>
        </button>
    );
}
