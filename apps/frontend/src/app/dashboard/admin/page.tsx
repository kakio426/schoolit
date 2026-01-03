"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function AdminPage() {
    const { token, user } = useAuth();
    const [pendingCerts, setPendingCerts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchPending();
    }, [token]);

    const fetchPending = async () => {
        if (!token) return;
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/admin/certifications/pending`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setPendingCerts(data);
            }
        } catch (err) {
            console.error('Failed to fetch pending certifications');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (id: number, status: 'APPROVED' | 'REJECTED') => {
        if (!token) return;
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/admin/certifications/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            });

            if (response.ok) {
                fetchPending();
            }
        } catch (err) {
            console.error('Failed to update status');
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
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-slate-800 mb-8">인증 관리 (Admin)</h1>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 bg-slate-50 border-b border-slate-200">
                        <h2 className="font-semibold text-slate-700">대기 중인 인증 요청 {pendingCerts.length}건</h2>
                    </div>

                    {isLoading ? (
                        <div className="p-10 text-center">로딩 중...</div>
                    ) : pendingCerts.length === 0 ? (
                        <div className="p-10 text-center text-slate-400">대기 중인 요청이 없습니다.</div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {pendingCerts.map((cert) => (
                                <div key={cert.id} className="p-6 flex items-center justify-between">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                                            📄
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{cert.teacherProfile.user.name}</p>
                                            <p className="text-sm text-slate-500">{cert.teacherProfile.user.email}</p>
                                            <div className="mt-2 flex items-center space-x-2 text-xs">
                                                <span className="bg-slate-100 px-2 py-0.5 rounded-lg text-slate-600">파일명: {cert.name}</span>
                                                <a
                                                    href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${cert.fileUrl}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:underline font-semibold"
                                                >
                                                    파일 확인
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleStatusUpdate(cert.id, 'APPROVED')}
                                            className="px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-green-600 transition-all active:scale-95"
                                        >
                                            승인
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(cert.id, 'REJECTED')}
                                            className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-red-600 transition-all active:scale-95"
                                        >
                                            반려
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
