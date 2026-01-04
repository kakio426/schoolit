"use client";

import React, { useEffect, useState, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { api } from '@/lib/api';
import { ChatRoom, ChatMessage, User } from '@/types';
import { Role } from '@/lib/constants';

export default function MessagesPage() {
    const { user } = useAuth();
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useState<any[]>([]); // Messages with sender info
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { socket } = useSocket();

    useEffect(() => {
        fetchRooms();
    }, []);

    useEffect(() => {
        if (selectedRoom) {
            fetchMessages(selectedRoom.id);
        }
    }, [selectedRoom]);

    useEffect(() => {
        if (!socket) return;

        const onNewMessage = (msg: any) => {
            if (selectedRoom && msg.chatRoomId === selectedRoom.id) {
                setMessages((prev) => {
                    if (prev.find(m => m.id === msg.id)) return prev;
                    return [...prev, msg];
                });
            }

            setRooms((prev) => {
                const updated = prev.map(r =>
                    r.id === msg.chatRoomId ? { ...r, messages: [msg] } : r
                );
                // Sort by last message time if possible, or just move to top
                const roomIndex = updated.findIndex(r => r.id === msg.chatRoomId);
                if (roomIndex > -1) {
                    const room = updated.splice(roomIndex, 1)[0];
                    return [room, ...updated];
                }
                return updated;
            });
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
            const data = await api.get<ChatRoom[]>('/chat/rooms');
            setRooms(data);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchMessages = async (roomId: number) => {
        try {
            const data = await api.get<any[]>(`/chat/rooms/${roomId}/messages`);
            setMessages(data);
        } catch (e) {
            console.error(e);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedRoom) return;
        try {
            await api.post(`/chat/rooms/${selectedRoom.id}/messages`, { content: newMessage });
            setNewMessage('');
            fetchMessages(selectedRoom.id);
        } catch (e) {
            console.error(e);
        }
    };

    const getOtherUserName = (room: ChatRoom) => {
        if (!room.users || room.users.length === 0) return 'Unknown';
        const other = room.users[0];
        if (other.role === Role.SCHOOL && other.schoolProfile) return other.schoolProfile.schoolName || other.name;
        return other.name;
    };

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col md:flex-row gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Room List */}
                <div className="w-full md:w-1/3 bg-surface rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col shadow-sm">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                        <h2 className="font-bold text-foreground">채팅 목록</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {rooms.length === 0 ? (
                            <div className="p-8 text-center text-foreground-muted text-sm">
                                진행 중인 대화가 없습니다.
                            </div>
                        ) : (
                            rooms.map((room) => {
                                const otherName = getOtherUserName(room);
                                const lastMsg = room.messages?.[0]?.content || '대화를 시작하세요';
                                const isActive = selectedRoom?.id === room.id;
                                return (
                                    <div
                                        key={room.id}
                                        onClick={() => setSelectedRoom(room)}
                                        className={`p-6 border-b border-slate-50 dark:border-slate-800/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all ${isActive ? 'bg-primary/5 dark:bg-primary/10 border-l-4 border-l-primary' : ''}`}
                                    >
                                        <div className="font-bold text-foreground mb-1">{otherName}</div>
                                        <div className="text-sm text-foreground-muted line-clamp-1">{lastMsg}</div>
                                        <div className="text-xs text-foreground-muted/50 mt-2 text-right">
                                            {room.createdAt ? new Date(room.createdAt).toLocaleDateString() : '-'}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Chat Window */}
                <div className="flex-1 bg-surface rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col shadow-sm">
                    {selectedRoom ? (
                        <>
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                                <h2 className="font-bold text-foreground text-lg">{getOtherUserName(selectedRoom)}</h2>
                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold rounded-lg">채팅 중</span>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/20 dark:bg-slate-900/10">
                                {messages.map((msg, index) => {
                                    const isMe = msg.sender?.id === user?.id;
                                    const isSystem = !msg.sender; // System messages have no sender

                                    // Date Separator Logic
                                    const showDateSeparator = index === 0 ||
                                        new Date(messages[index - 1].createdAt).toDateString() !== new Date(msg.createdAt || Date.now()).toDateString();

                                    return (
                                        <React.Fragment key={msg.id || index}>
                                            {showDateSeparator && (
                                                <div className="flex justify-center my-6">
                                                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                                                        {new Date(msg.createdAt || Date.now()).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                                                    </span>
                                                </div>
                                            )}

                                            {isSystem ? (
                                                <div className="flex justify-center my-2">
                                                    <span className="text-sm text-foreground-muted bg-slate-100/50 dark:bg-slate-800/30 px-3 py-1 rounded-lg">
                                                        📢 {msg.content}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[70%] rounded-2xl px-5 py-3 text-sm shadow-sm transition-all ${isMe ? 'bg-primary text-white rounded-br-none shadow-primary/20' : 'bg-surface border border-slate-200 dark:border-slate-700 text-foreground rounded-bl-none'}`}>
                                                        {msg.content}
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 self-end ml-1 mb-1">
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="p-6 bg-surface border-t border-slate-100 dark:border-slate-800">
                                <div className="flex gap-3 items-end">
                                    <button
                                        onClick={() => alert('파일 전송 기능은 준비 중입니다. 견적서는 이메일로 발송해 주세요.')}
                                        className="p-3 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors shrink-0"
                                        title="파일 첨부"
                                    >
                                        <span className="text-xl">📎</span>
                                    </button>
                                    <div className="flex-1 flex gap-3">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                            placeholder="견적 및 일정 조율을 위한 메시지를 입력하세요..."
                                            className="flex-1 px-5 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                                        />
                                        <button
                                            onClick={sendMessage}
                                            className="px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95 shrink-0"
                                        >
                                            전송
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-foreground-muted">
                            <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-4xl mb-6 shadow-inner">💬</div>
                            <p className="font-medium">대화 상대를 선택해주세요.</p>
                            <p className="text-sm mt-1">상담 및 면접을 위한 안전한 채팅 공간입니다.</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
