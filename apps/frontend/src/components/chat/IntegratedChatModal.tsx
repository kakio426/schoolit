import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, FileText, Loader2, MessageSquare, Heart, Bug, Lightbulb, HelpCircle, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    sources?: Array<{
        source: string;
        page?: number;
        snippet: string;
    }>;
}

interface IntegratedChatModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const FEEDBACK_CATEGORIES = [
    { id: 'PROPOSAL', label: '제안하기', icon: Lightbulb, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    { id: 'BUG', label: '불편/버그', icon: Bug, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
    { id: 'PRAISE', label: '칭찬/응원', icon: Heart, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
    { id: 'INQUIRY', label: '일반 문의', icon: HelpCircle, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
];

export default function IntegratedChatModal({ isOpen, onClose }: IntegratedChatModalProps) {
    const [mode, setMode] = useState<'CHAT' | 'FEEDBACK'>('CHAT');

    // --- Chat Logic ---
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        if (isOpen && mode === 'CHAT') {
            scrollToBottom();
            // Focus input slightly after open
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, mode, messages, scrollToBottom]);

    const handleChatSubmit = async (e?: React.FormEvent) => {
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

            if (!res.ok) throw new Error('Failed to get answer');

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
                    content: '죄송합니다. 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
                },
            ]);
        } finally {
            setIsLoading(false);
            if (isOpen) inputRef.current?.focus();
        }
    };

    // --- Feedback Logic ---
    const [feedbackCategory, setFeedbackCategory] = useState('PROPOSAL');
    const [feedbackContent, setFeedbackContent] = useState('');
    const [isFeedbackSubmitting, setIsFeedbackSubmitting] = useState(false);
    const [isFeedbackSuccess, setIsFeedbackSuccess] = useState(false);

    const handleFeedbackSubmit = async () => {
        if (!feedbackContent.trim()) return;
        setIsFeedbackSubmitting(true);
        try {
            await api.post('/feedback', {
                category: feedbackCategory,
                content: feedbackContent
            });
            setIsFeedbackSuccess(true);
            setTimeout(() => {
                setIsFeedbackSuccess(false);
                setFeedbackContent('');
                setFeedbackCategory('PROPOSAL');
                // Optional: Switch back to chat or close? Let's just reset form.
            }, 2000);
        } catch (error) {
            alert('의견 전송 실패. 다시 시도해주세요.');
        } finally {
            setIsFeedbackSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:justify-end sm:p-6 pointer-events-none">
            {/* Backdrop for mobile */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/20 sm:bg-transparent sm:hidden pointer-events-auto"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 50 }}
                className="bg-white dark:bg-zinc-900 w-full sm:w-[400px] h-[80vh] sm:h-[600px] shadow-2xl rounded-t-2xl sm:rounded-2xl flex flex-col pointer-events-auto border border-slate-200 dark:border-zinc-800 overflow-hidden"
            >
                {/* Header */}
                <div className="flex-shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/50">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">스쿨잇 봇 🤖</h3>
                            <p className="text-xs text-white/80">무엇이든 도와드릴게요!</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 dark:border-zinc-800">
                    <button
                        onClick={() => setMode('CHAT')}
                        className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative ${mode === 'CHAT' ? 'text-primary' : 'text-slate-500 hover:text-slate-700 dark:text-zinc-400'
                            }`}
                    >
                        <MessageSquare size={16} />
                        AI 채팅
                        {mode === 'CHAT' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
                    </button>
                    <button
                        onClick={() => setMode('FEEDBACK')}
                        className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative ${mode === 'FEEDBACK' ? 'text-primary' : 'text-slate-500 hover:text-slate-700 dark:text-zinc-400'
                            }`}
                    >
                        <Heart size={16} />
                        의견 보내기
                        {mode === 'FEEDBACK' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden relative bg-slate-50 dark:bg-zinc-950/50">
                    {mode === 'CHAT' ? (
                        <div className="flex flex-col h-full">
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-60">
                                        <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
                                            <Bot size={40} className="text-indigo-500" />
                                        </div>
                                        <h4 className="font-semibold text-lg mb-2">안녕하세요! 👋</h4>
                                        <p className="text-sm text-slate-500 dark:text-zinc-400">
                                            방과후 업무나 지침에 대해 궁금한 점이 있으신가요?
                                        </p>
                                    </div>
                                )}
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        {msg.role === 'assistant' && (
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                                                <Bot size={16} className="text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                        )}
                                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${msg.role === 'user'
                                            ? 'bg-primary text-white rounded-br-none'
                                            : 'bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-bl-none text-slate-800 dark:text-slate-200'
                                            }`}>
                                            <div className="whitespace-pre-wrap">{msg.content}</div>
                                            {msg.sources && msg.sources.length > 0 && (
                                                <div className="mt-2 pt-2 border-t border-slate-200/20">
                                                    <p className="text-[10px] opacity-70 mb-1 font-bold">참고 문서:</p>
                                                    {msg.sources.map((s, i) => (
                                                        <div key={i} className="flex items-center gap-1 text-[10px] opacity-80">
                                                            <FileText size={10} />
                                                            {s.source} {s.page && `(${s.page}p)`}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                                            <Bot size={16} className="text-indigo-600" />
                                        </div>
                                        <div className="bg-white dark:bg-zinc-800 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                                            <Loader2 size={14} className="animate-spin text-slate-400" />
                                            <span className="text-xs text-slate-500">답변 생성 중...</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <form onSubmit={handleChatSubmit} className="p-4 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 shrink-0">
                                <div className="relative">
                                    <input
                                        ref={inputRef}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="질문을 입력하세요..."
                                        className="w-full pl-4 pr-12 py-3 bg-slate-100 dark:bg-zinc-800 rounded-full border-none focus:ring-2 focus:ring-primary/50 text-sm"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!input.trim() || isLoading}
                                        className="absolute right-2 top-2 p-1.5 bg-primary text-white rounded-full disabled:opacity-50 hover:bg-primary-hover transition-colors"
                                    >
                                        <Send size={16} />
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="h-full overflow-y-auto p-6">
                            {isFeedbackSuccess ? (
                                <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle size={32} />
                                    </div>
                                    <h4 className="text-xl font-bold mb-2 text-slate-800 dark:text-white">소중한 의견 감사합니다!</h4>
                                    <p className="text-sm text-slate-500">
                                        보내주신 의견은 운영진에게 전달되었습니다.<br />
                                        더 나은 서비스를 위해 노력하겠습니다.
                                    </p>
                                    <button
                                        onClick={() => setIsFeedbackSuccess(false)}
                                        className="mt-6 px-6 py-2 bg-slate-100 dark:bg-zinc-800 rounded-full text-sm font-medium hover:bg-slate-200 transition-colors"
                                    >
                                        다른 의견 보내기
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="text-center mb-6">
                                        <h4 className="font-bold text-lg mb-1 text-slate-800 dark:text-white">어떤 이야기를 들려주시겠어요?</h4>
                                        <p className="text-xs text-slate-500">칭찬은 고래도 춤추게 합니다 🐳</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {FEEDBACK_CATEGORIES.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setFeedbackCategory(cat.id)}
                                                className={`p-3 rounded-xl border text-left transition-all ${feedbackCategory === cat.id
                                                    ? `border-${cat.color.split('-')[1]} ring-1 ring-${cat.color.split('-')[1]} ${cat.bg}`
                                                    : 'border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <cat.icon size={18} className={cat.color} />
                                                    <span className={`text-sm font-bold ${feedbackCategory === cat.id ? 'text-slate-900 dark:text-white' : 'text-slate-600'}`}>
                                                        {cat.label}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 ml-1">내용</label>
                                        <textarea
                                            value={feedbackContent}
                                            onChange={(e) => setFeedbackContent(e.target.value)}
                                            placeholder="자유롭게 의견을 적어주세요..."
                                            className="w-full h-32 p-4 rounded-xl resize-none bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:ring-2 focus:ring-primary/50 focus:outline-none transition-all placeholder:text-slate-400 text-sm"
                                        ></textarea>
                                    </div>

                                    <button
                                        onClick={handleFeedbackSubmit}
                                        disabled={!feedbackContent.trim() || isFeedbackSubmitting}
                                        className="w-full py-3.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm shadow-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isFeedbackSubmitting ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                전송 중...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={16} />
                                                보내기
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
