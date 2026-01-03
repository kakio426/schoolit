"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProfileBadge from '@/components/ui/ProfileBadge';
import FileUpload from '@/components/ui/FileUpload';

export default function ProfilePage() {
    const { user, token, refreshProfile } = useAuth();
    const [bio, setBio] = useState('');
    const [subjects, setSubjects] = useState<string[]>([]);
    const [regions, setRegions] = useState<string[]>([]);
    const [certifications, setCertifications] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const fetchCertifications = async () => {
        if (!token) return;
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/users/certifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCertifications(data);
            }
        } catch (err) {
            console.error('Failed to fetch certifications');
        }
    };

    useEffect(() => {
        if (user?.teacherProfile) {
            setBio(user.teacherProfile.bio || '');
            setSubjects(user.teacherProfile.subjects || []);
            setRegions(user.teacherProfile.regions || []);
            fetchCertifications();
        }
    }, [user, token]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/users/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    bio,
                    subjects,
                    regions,
                }),
            });

            if (response.ok) {
                setMessage({ type: 'success', text: '프로필이 저장되었습니다.' });
                await refreshProfile();
            } else {
                setMessage({ type: 'error', text: '저장에 실패했습니다.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: '네트워크 오류가 발생했습니다.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) return null;

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-slate-800">프로필 관리</h1>
                    <ProfileBadge isVerified={user.teacherProfile?.isVerified || false} />
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">자기소개</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                                placeholder="선생님에 대해 학교에 소개해주세요."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">희망 과목 (쉼표로 구분)</label>
                            <input
                                type="text"
                                value={subjects.join(', ')}
                                onChange={(e) => setSubjects(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="예: 드론, 코딩, 로봇"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">활동 가능 지역 (쉼표로 구분)</label>
                            <input
                                type="text"
                                value={regions.join(', ')}
                                onChange={(e) => setRegions(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="예: 서울 강남구, 경기 판교"
                            />
                        </div>
                    </div>

                    {/* Trust Indicators Section */}
                    {user.reviewStats && user.reviewStats.totalReviews > 0 && (
                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <span>🎖️</span> 학교의 평가 지표
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10">
                                    <p className="text-sm font-semibold text-slate-500 mb-1">학교 만족도</p>
                                    <p className="text-3xl font-black text-primary">
                                        {Math.round(user.reviewStats.reMatchRate)}%
                                    </p>
                                    <p className="text-xs text-slate-400 mt-2">학교에서 "다시 일하고 싶어요"라고 응답한 비율</p>
                                </div>
                                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-sm font-semibold text-amber-700">최우수 키워드</p>
                                        {user.reviewStats.isVeteran && (
                                            <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-black rounded uppercase tracking-tighter shadow-sm">
                                                Veteran
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {user.reviewStats.topKeywords.map((kw, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-white rounded-full text-xs font-bold text-amber-600 border border-amber-200 shadow-sm">
                                                #{kw.keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {message && (
                        <div className={`p-4 rounded-2xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className={`px-8 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all ${isSaving ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
                        >
                            {isSaving ? '저장 중...' : '변경사항 저장'}
                        </button>
                    </div>
                </form>

                <div className="mt-12 space-y-6">
                    <h2 className="text-xl font-bold text-slate-800">자격증 및 증명서</h2>

                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                        <FileUpload
                            token={token}
                            onUploadSuccess={() => {
                                setMessage({ type: 'success', text: '인증 요청이 제출되었습니다.' });
                                fetchCertifications();
                            }}
                        />

                        {certifications.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">제출된 문서</h3>
                                <div className="space-y-3">
                                    {certifications.map((cert) => (
                                        <div key={cert.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                            <div className="flex items-center space-x-3">
                                                <span className="text-xl">📄</span>
                                                <div>
                                                    <p className="font-medium text-slate-700">{cert.name}</p>
                                                    <p className="text-xs text-slate-400">{new Date(cert.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${cert.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                    cert.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                        'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {cert.status === 'APPROVED' ? '승인됨' :
                                                        cert.status === 'REJECTED' ? '반려됨' : '심사중'}
                                                </span>
                                                <a
                                                    href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${cert.fileUrl}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:underline text-sm font-semibold"
                                                >
                                                    보기
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
