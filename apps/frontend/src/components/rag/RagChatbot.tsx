'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, FileText, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    sources?: Array<{
        source: string;
        page?: number;
        snippet: string;
    }>;
}

interface RagChatbotProps {
    placeholder?: string;
}

export function RagChatbot({
    placeholder = '지침에 대해 질문하세요...',
}: RagChatbotProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const question = input.trim();
        setInput('');
        setMessages((prev) => [...prev, { role: 'user', content: question }]);
        setIsLoading(true);

        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/rag/ask`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ question }),
            });

            if (!res.ok) {
                throw new Error('응답을 받지 못했습니다.');
            }

            const data = await res.json();
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: data.answer,
                    sources: data.sources,
                },
            ]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content:
                        '죄송합니다. 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
                },
            ]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="flex flex-col h-[600px] bg-card rounded-2xl border border-border overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/30">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h3 className="font-semibold">스쿨잇 AI 어시스턴트</h3>
                    <p className="text-xs text-muted-foreground">
                        업로드된 지침 문서를 기반으로 답변합니다
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                        <Bot className="w-16 h-16 mb-4 opacity-30" />
                        <p className="text-lg font-medium mb-2">무엇이든 물어보세요</p>
                        <p className="text-sm max-w-[280px]">
                            예: &ldquo;방과후 강사 계약 절차가 어떻게 되나요?&rdquo;
                        </p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                    >
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4 text-primary" />
                            </div>
                        )}

                        <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                ? 'bg-primary text-primary-foreground rounded-br-md'
                                : 'bg-muted rounded-bl-md'
                                }`}
                        >
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                            {/* Sources */}
                            {msg.sources && msg.sources.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-border/50">
                                    <p className="text-xs font-medium mb-2 opacity-70">참고 문서:</p>
                                    <div className="space-y-1">
                                        {msg.sources.map((source, sIdx) => (
                                            <div
                                                key={sIdx}
                                                className="flex items-center gap-2 text-xs opacity-70"
                                            >
                                                <FileText className="w-3 h-3" />
                                                <span>
                                                    {source.source}
                                                    {source.page && ` (${source.page}p)`}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-secondary-foreground" />
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-primary" />
                        </div>
                        <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>답변을 생성하고 있습니다...</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
                onSubmit={handleSubmit}
                className="p-4 border-t border-border bg-muted/30"
            >
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={isLoading}
                        className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary/50
                     disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <Button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="px-4"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </form>
        </div>
    );
}
