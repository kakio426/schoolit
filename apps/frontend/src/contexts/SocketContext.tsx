"use client";
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { api } from '@/lib/api';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    unreadCount: number;
    unreadMessageCount: number;
    unreadNotificationCount: number;
    notifications: any[];
    resetUnread: () => void;
    resetUnreadMessages: () => void;
    markNotificationAsRead: (id: number) => void;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    unreadCount: 0,
    unreadMessageCount: 0,
    unreadNotificationCount: 0,
    notifications: [],
    resetUnread: () => { },
    resetUnreadMessages: () => { },
    markNotificationAsRead: () => { },
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);
    const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
    const [notifications, setNotifications] = useState<any[]>([]);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!token) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            setIsConnected(false);
            return;
        }

        // Fetch initial notifications count
        api.get<any[]>('/notifications')
            .then(data => {
                setNotifications(data);
                setUnreadNotificationCount(data.filter((n: any) => !n.isRead).length);
            })
            .catch(console.error);

        const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/api$/, '');
        const socket = io(apiUrl, {
            auth: { token },
            transports: ['websocket'],
        });

        socket.on('connect', () => {
            setIsConnected(true);
            console.log('Socket connected at root');
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        socket.on('newMessage', (msg) => {
            if (window.location.pathname !== '/dashboard/messages') {
                setUnreadMessageCount(prev => prev + 1);
            }
        });

        socket.on('notification', (notif) => {
            setUnreadNotificationCount(prev => prev + 1);
            setNotifications(prev => [notif, ...prev]);
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
        };
    }, [token]);

    const resetUnreadMessages = () => setUnreadMessageCount(0);
    const markNotificationAsRead = (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        setUnreadNotificationCount(prev => Math.max(0, prev - 1));

        api.patch(`/notifications/${id}/read`, {}).catch(console.error);
    }

    return (
        <SocketContext.Provider value={{
            socket: socketRef.current,
            isConnected,
            unreadCount: unreadMessageCount + unreadNotificationCount, // Legacy support
            unreadMessageCount,
            unreadNotificationCount,
            notifications,
            resetUnread: resetUnreadMessages, // Legacy
            resetUnreadMessages,
            markNotificationAsRead
        }}>
            {children}
        </SocketContext.Provider>
    );
};
