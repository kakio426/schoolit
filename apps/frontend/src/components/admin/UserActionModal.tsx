"use client";

import React, { useState } from 'react';
import { User } from '@/types';
import { Role } from '@/lib/constants';

interface UserActionModalProps {
    user: User;
    onClose: () => void;
    onUpdate: () => void;
}

export const UserActionModal: React.FC<UserActionModalProps> = ({ user, onClose, onUpdate }) => {
    const [selectedRole, setSelectedRole] = useState(user.role);
    const [isBanned, setIsBanned] = useState(user.isBanned || false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('accessToken');

            // Update ban status
            if (isBanned !== user.isBanned) {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${user.id}/ban`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ isBanned }),
                });
            }

            // Update role
            if (selectedRole !== user.role) {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${user.id}/role`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ role: selectedRole }),
                });
            }

            onUpdate();
            onClose();
        } catch (error) {
            alert('업데이트 실패');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="bg-surface rounded-3xl shadow-2xl max-w-md w-full p-8 pointer-events-auto animate-in zoom-in-95 fade-in duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2 className="text-2xl font-bold text-foreground mb-6">사용자 관리</h2>

                    <div className="space-y-6">
                        {/* User Info */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                            <div className="font-bold text-foreground">{user.name}</div>
                            <div className="text-sm text-foreground-muted">{user.email}</div>
                        </div>

                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-bold text-foreground mb-2">역할 변경</label>
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value as Role)}
                                className="w-full px-4 py-3 bg-surface border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 ring-primary/20 outline-none text-foreground"
                            >
                                <option value={Role.TEACHER}>선생님</option>
                                <option value={Role.SCHOOL}>학교</option>
                                <option value={Role.BUSINESS}>기업</option>
                                <option value={Role.ADMIN}>관리자</option>
                            </select>
                        </div>

                        {/* Ban Toggle */}
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl">
                            <div>
                                <div className="font-bold text-foreground">계정 정지</div>
                                <div className="text-xs text-foreground-muted">정지된 사용자는 로그인할 수 없습니다</div>
                            </div>
                            <button
                                onClick={() => setIsBanned(!isBanned)}
                                className={`relative w-14 h-8 rounded-full transition-colors ${isBanned ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-600'
                                    }`}
                            >
                                <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${isBanned ? 'translate-x-6' : ''
                                    }`} />
                            </button>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-foreground rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? '처리 중...' : '저장'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
