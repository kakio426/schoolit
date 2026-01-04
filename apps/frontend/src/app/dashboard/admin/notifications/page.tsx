"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import { Role } from '@/lib/constants';
import { Send, Users, CheckCircle } from 'lucide-react';

export default function AdminNotificationsPage() {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [targetRoles, setTargetRoles] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<{ sent: number; targetUsers: number } | null>(null);

    const handleRoleToggle = (role: string) => {
        setTargetRoles(prev =>
            prev.includes(role)
                ? prev.filter(r => r !== role)
                : [...prev, role]
        );
    };

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) {
            alert('제목과 내용을 입력해주세요.');
            return;
        }

        if (!confirm(`${targetRoles.length === 0 ? '전체 사용자' : targetRoles.join(', ')}에게 공지를 발송하시겠습니까?`)) {
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await api.post<{ sent: number; targetUsers: number }>(
                '/admin/notifications/broadcast',
                {
                    title,
                    content,
                    targetRoles: targetRoles.length > 0 ? targetRoles : undefined,
                }
            );
            setResult(response);
            setTitle('');
            setContent('');
            setTargetRoles([]);
        } catch (error) {
            alert('발송 실패');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (user?.role !== 'ADMIN') {
        return (
            <DashboardLayout>
                <div className="text-center py-20">
                    <p className="text-red-500 font-bold">접근 권한이 없습니다.</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">시스템 공지 발송</h1>
                    <p className="text-foreground-muted">전체 사용자 또는 특정 역할에게 공지를 발송하세요.</p>
                </div>

                {/* Success Message */}
                {result && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <CheckCircle className="text-green-600 dark:text-green-400" size={32} />
                        <div>
                            <div className="font-bold text-green-900 dark:text-green-100 text-lg">발송 완료!</div>
                            <div className="text-green-700 dark:text-green-300 text-sm">
                                {result.targetUsers}명의 사용자에게 {result.sent}개의 알림이 전송되었습니다.
                            </div>
                        </div>
                    </div>
                )}

                {/* Notification Form */}
                <div className="bg-surface rounded-3xl border border-slate-200/50 dark:border-slate-700 shadow-sm p-8 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-bold text-foreground mb-2">공지 제목</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="예: 시스템 점검 안내"
                            className="w-full px-4 py-3 bg-surface border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 ring-primary/20 outline-none text-foreground"
                        />
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-bold text-foreground mb-2">공지 내용</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="사용자에게 전달할 메시지를 입력하세요..."
                            rows={6}
                            className="w-full px-4 py-3 bg-surface border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 ring-primary/20 outline-none text-foreground resize-none"
                        />
                    </div>

                    {/* Target Audience */}
                    <div>
                        <label className="block text-sm font-bold text-foreground mb-3">대상 선택</label>
                        <div className="space-y-2">
                            <div
                                onClick={() => setTargetRoles([])}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${targetRoles.length === 0
                                        ? 'border-primary bg-primary/5'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Users className="text-primary" size={20} />
                                    <div>
                                        <div className="font-bold text-foreground">전체 사용자</div>
                                        <div className="text-xs text-foreground-muted">모든 역할의 사용자에게 발송</div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                {[Role.TEACHER, Role.SCHOOL, Role.BUSINESS].map((role) => (
                                    <div
                                        key={role}
                                        onClick={() => handleRoleToggle(role)}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${targetRoles.includes(role)
                                                ? 'border-primary bg-primary/5'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className="font-bold text-foreground text-sm">
                                            {role === Role.TEACHER && '👨‍🏫 선생님'}
                                            {role === Role.SCHOOL && '🏫 학교'}
                                            {role === Role.BUSINESS && '🏢 기업'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Preview */}
                    {(title || content) && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                            <div className="text-xs font-bold text-foreground-muted mb-3">미리보기</div>
                            <div className="space-y-2">
                                <div className="font-bold text-foreground">{title || '(제목 없음)'}</div>
                                <div className="text-sm text-foreground-muted whitespace-pre-wrap">
                                    {content || '(내용 없음)'}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !title.trim() || !content.trim()}
                        className="w-full px-6 py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Send size={20} />
                        {isSubmitting ? '발송 중...' : '공지 발송'}
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}
