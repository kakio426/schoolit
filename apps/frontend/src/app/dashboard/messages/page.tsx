"use client";
import React, { useEffect, useState, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';

export default function MessagesPage() {
    const { token, user } = useAuth();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    const [rooms, setRooms] = useState<any[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { socket } = useSocket();

    useEffect(() => {
        if (token) fetchRooms();
    }, [token]);

    useEffect(() => {
        if (selectedRoom) {
            fetchMessages(selectedRoom.id);
        }
    }, [selectedRoom]);

    useEffect(() => {
        if (!socket) return;

        const onNewMessage = (msg: any) => {
            // Update messages if this is the active room
            if (selectedRoom && msg.chatRoomId === selectedRoom.id) {
                setMessages((prev) => {
                    // Avoid duplicates
                    if (prev.find(m => m.id === msg.id)) return prev;
                    return [...prev, msg];
                });
            }

            // Update rooms list last message
            setRooms((prev) => prev.map(r =>
                r.id === msg.chatRoomId ? { ...r, messages: [msg] } : r
            ).sort((a, b) => {
                if (a.id === msg.chatRoomId) return -1;
                if (b.id === msg.chatRoomId) return 1;
                return 0;
            }));
        };

        socket.on('newMessage', onNewMessage);
        return () => {
            socket.off('newMessage', onNewMessage);
        };
    }, [socket, selectedRoom]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fetchRooms = async () => {
        try {
            const res = await fetch(`${API_URL}/api/chat/rooms`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setRooms(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchMessages = async (roomId: number) => {
        try {
            const res = await fetch(`${API_URL}/api/chat/rooms/${roomId}/messages`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedRoom) return;
        try {
            const res = await fetch(`${API_URL}/api/chat/rooms/${selectedRoom.id}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ content: newMessage }),
            });
            if (res.ok) {
                setNewMessage('');
                fetchMessages(selectedRoom.id);
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Helper to get other user name
    const getOtherUser = (room: any) => {
        if (!room.users || room.users.length === 0) return { name: 'Unknown' };
        // Since backend filtered out 'me', users[0] is the other person
        const other = room.users[0];
        // If School, show SchoolName?
        if (other.role === 'SCHOOL' && other.schoolProfile) return other.schoolProfile.schoolName || other.name;
        return other.name;
    };

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col md:flex-row gap-4">
                {/* Room List */}
                <div className="w-full md:w-1/3 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <h2 className="font-bold text-slate-800">채팅 목록</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {rooms.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-sm">
                                진행 중인 대화가 없습니다.
                            </div>
                        ) : (
                            rooms.map((room) => {
                                const otherName = getOtherUser(room);
                                const lastMsg = room.messages?.[0]?.content || '대화를 시작하세요';
                                const isActive = selectedRoom?.id === room.id;
                                return (
                                    <div
                                        key={room.id}
                                        onClick={() => setSelectedRoom(room)}
                                        className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${isActive ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
                                    >
                                        <div className="font-bold text-slate-700 mb-1">{otherName}</div>
                                        <div className="text-sm text-slate-500 line-clamp-1">{lastMsg}</div>
                                        <div className="text-xs text-slate-300 mt-2 text-right">
                                            {new Date(room.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Chat Window */}
                <div className="flex-1 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
                    {selectedRoom ? (
                        <>
                            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                <h2 className="font-bold text-slate-800">{getOtherUser(selectedRoom)}</h2>
                                <span className="text-xs text-slate-400">면접 진행 중</span>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                                {messages.map((msg) => {
                                    const isMe = msg.sender.id === user?.id;
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${isMe ? 'bg-primary text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'}`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    )
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="p-4 bg-white border-t border-slate-100">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                        placeholder="메시지를 입력하세요..."
                                        className="flex-1 px-4 py-2 bg-slate-100 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                    <button
                                        onClick={sendMessage}
                                        className="px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
                                    >
                                        전송
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                            <span className="text-4xl mb-4">💬</span>
                            <p>대화 상대를 선택해주세요.</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
