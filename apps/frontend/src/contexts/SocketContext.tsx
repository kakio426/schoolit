
"use client";
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    unreadCount: number;
    resetUnread: () => void;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    unreadCount: 0,
    resetUnread: () => { },
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
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
            // Logic for incrementing unread count if not on messages page
            // For now, simple increment
            if (window.location.pathname !== '/dashboard/messages') {
                setUnreadCount(prev => prev + 1);
            }
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
        };
    }, [token]);

    const resetUnread = () => setUnreadCount(0);

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, isConnected, unreadCount, resetUnread }}>
            {children}
        </SocketContext.Provider>
    );
};
