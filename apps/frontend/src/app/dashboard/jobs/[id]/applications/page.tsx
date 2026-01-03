"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useParams } from 'next/navigation';
import ReviewModal from '@/components/reviews/ReviewModal';


export default function JobApplicantsPage() {
    const { id } = useParams(); // jobId
    const { token, user } = useAuth();
    const [applicants, setApplicants] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState<any>(null);


    useEffect(() => {
        if (token && id) {
            fetchApplicants();
        }
    }, [token, id]);

    const fetchApplicants = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/applications/jobs/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setApplicants(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const updateStatus = async (appId: number, newStatus: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/applications/${appId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                const updated = await res.json();
                setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: updated.status, user: updated.user } : a));
                alert(`상태가 ${newStatus}(으)로 변경되었습니다.`);
            }
        } catch (e) {
            console.error(e);
            alert('오류 발생');
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING': return '검토중';
            case 'ACCEPTED': return '수락됨';
            case 'INTERVIEWING': return '면접중 💬';
            case 'HIRED': return '채용확정 🎉';
            case 'REJECTED': return '거절됨';
            default: return status;
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-700';
            case 'ACCEPTED': return 'bg-blue-100 text-blue-700';
            case 'INTERVIEWING': return 'bg-purple-100 text-purple-700';
            case 'HIRED': return 'bg-green-100 text-green-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    }

    if (user?.role !== 'SCHOOL') {
        return <DashboardLayout><div>권한이 없습니다.</div></DashboardLayout>;
    }

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto">
                <h1 className="text-2xl font-bold text-slate-800 mb-8">👥 지원자 관리</h1>

                {isLoading ? (
                    <div>로딩 중...</div>
                ) : applicants.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
                        아직 지원자가 없습니다.
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {applicants.map(app => (
                            <div key={app.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-slate-900">{app.user.name} 선생님</h3>
                                        <span className="text-slate-400 text-sm">@{app.user.email}</span>
                                        {app.isSuggestion && <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded">학교제안</span>}
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl text-slate-600 mb-4 ">
                                        "{app.message}"
                                    </div>
                                    {/* Contact Info - Visible if status is INTERVIEWING, ACCEPTED or HIRED */}
                                    {app.user.phone && (
                                        <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg w-fit">
                                            <span>📞 연락처:</span>
                                            <span className="font-bold">{app.user.phone}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2 min-w-[160px]">
                                    <div className="text-center mb-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(app.status)}`}>
                                            {getStatusText(app.status)}
                                        </span>
                                    </div>

                                    {app.status === 'PENDING' && (
                                        <>
                                            <button
                                                onClick={() => updateStatus(app.id, 'ACCEPTED')}
                                                className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors text-sm"
                                            >
                                                합격 처리
                                            </button>
                                            <button
                                                onClick={() => updateStatus(app.id, 'INTERVIEWING')}
                                                className="w-full py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors text-sm"
                                            >
                                                면접 제안 (채팅 생성)
                                            </button>
                                            <button
                                                onClick={() => updateStatus(app.id, 'REJECTED')}
                                                className="w-full py-2 bg-slate-100 text-slate-600 rounded-lg font-bold hover:bg-slate-200 transition-colors text-sm"
                                            >
                                                거절
                                            </button>
                                        </>
                                    )}

                                    {(app.status === 'ACCEPTED' || app.status === 'INTERVIEWING') && (
                                        <button
                                            onClick={() => updateStatus(app.id, 'HIRED')}
                                            className="w-full py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors text-sm"
                                        >
                                            채용 확정
                                        </button>
                                    )}

                                    {app.status === 'HIRED' && (
                                        <button
                                            onClick={() => {
                                                setSelectedApplicant(app);
                                                setIsReviewModalOpen(true);
                                            }}
                                            className="w-full py-2 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 transition-colors text-sm shadow-sm"
                                        >
                                            ⭐ 활동 평가 작성
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedApplicant && (
                <ReviewModal
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    receiverName={selectedApplicant.user.name}
                    receiverRole={selectedApplicant.user.role}
                    onSubmit={async (data) => {
                        try {
                            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/reviews`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${token}`
                                },
                                body: JSON.stringify({
                                    jobId: parseInt(id as string),
                                    receiverId: selectedApplicant.user.id,
                                    ...data
                                })
                            });

                            if (res.ok) {
                                alert('후기가 성공적으로 저장되었습니다!');
                                fetchApplicants(); // Refresh to potentially hide button
                            } else {
                                const err = await res.json();
                                alert(err.message || '저장 실패');
                            }
                        } catch (e) {
                            console.error(e);
                        }
                    }}
                />
            )}
        </DashboardLayout>
    );
}
