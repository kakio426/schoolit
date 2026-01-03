"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useRouter } from 'next/navigation';

export default function NewJobPage() {
    const { token, user } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subjects: '',
        regions: '',
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                subjects: formData.subjects.split(',').map(s => s.trim()).filter(Boolean),
                regions: formData.regions.split(',').map(s => s.trim()).filter(Boolean),
            };

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/jobs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                alert('공고가 등록되었습니다!');
                router.push('/dashboard/jobs');
            } else {
                alert('등록 실패. 학교 프로필을 먼저 작성했는지 확인해주세요.');
            }
        } catch (err) {
            console.error(err);
            alert('오류 발생');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    if (user?.role !== 'SCHOOL') {
        return <DashboardLayout><div>접근 권한 없음</div></DashboardLayout>
    }

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-slate-800 mb-6">📢 새 공고 등록</h1>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">공고 제목</label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-primary"
                                placeholder="예: 2024년 1학기 수학 기간제 교사 모집"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">상세 내용</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={6}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-primary resize-none"
                                placeholder="모집 요강, 자격 요건 등을 상세히 적어주세요."
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">과목 (콤마로 구분)</label>
                                <input
                                    name="subjects"
                                    value={formData.subjects}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-primary"
                                    placeholder="수학, 과학"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">지역 (콤마로 구분)</label>
                                <input
                                    name="regions"
                                    value={formData.regions}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-primary"
                                    placeholder="서울 강남구, 경기 분당"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all"
                            >
                                {isSaving ? '등록 중...' : '공고 등록하기'}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="w-full mt-3 py-3 text-slate-500 font-medium hover:text-slate-800 transition-colors"
                            >
                                취소
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
