"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import WarningModal from '@/components/ui/WarningModal';

export default function NewJobPage() {
    const { user } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subjects: '',
        regions: '',
        budget: '', // Added budget field
    });
    const [isSaving, setIsSaving] = useState(false);
    const [showBudgetWarning, setShowBudgetWarning] = useState(false);

    // Compliance Limit: 20 Million KRW
    const [lastWarningValue, setLastWarningValue] = useState(0);

    const checkBudgetLimit = (value: string) => {
        const numValue = parseInt(value.replace(/,/g, ''), 10) || 0;
        if (numValue > 20000000) {
            // Only warn if we haven't warned for this "crossing" yet (simple debounce logic or just show it)
            // Implementation: Show simple warning modal
            setShowBudgetWarning(true);
        }
    };

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

            await api.post('/jobs', payload);
            alert('공고가 등록되었습니다!');
            router.push('/dashboard/jobs');
        } catch (err: any) {
            console.error(err);
            alert(err.message || '등록 실패. 학교 프로필을 먼저 작성했는지 확인해주세요.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'budget') {
            checkBudgetLimit(value);
        }
    }

    if (user?.role !== 'SCHOOL') {
        return <DashboardLayout><div>접근 권한 없음</div></DashboardLayout>
    }

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="text-2xl font-bold text-foreground mb-6">📢 새 공고 등록</h1>

                <div className="bg-surface rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">공고 제목</label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-surface rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-primary text-foreground"
                                placeholder="예: 2024년 1학기 수학 기간제 교사 모집"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">예상 예산 (원)</label>
                            <input
                                name="budget"
                                type="number"
                                value={formData.budget}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-surface rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-primary text-foreground"
                                placeholder="숫자만 입력 (예: 15000000)"
                            />
                            <p className="text-xs text-foreground-muted mt-1">
                                * 2,000만 원 초과 시 수의계약 대상에서 제외될 수 있습니다.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">상세 내용</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={6}
                                className="w-full px-4 py-3 bg-surface rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-primary resize-none text-foreground"
                                placeholder="모집 요강, 자격 요건 등을 상세히 적어주세요."
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">과목 (콤마로 구분)</label>
                                <input
                                    name="subjects"
                                    value={formData.subjects}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-surface rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-primary text-foreground"
                                    placeholder="수학, 과학"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">지역 (콤마로 구분)</label>
                                <input
                                    name="regions"
                                    value={formData.regions}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-surface rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-primary text-foreground"
                                    placeholder="서울 강남구, 경기 분당"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                            >
                                {isSaving ? '등록 중...' : '공고 등록하기'}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="w-full mt-3 py-3 text-foreground-muted font-medium hover:text-foreground transition-colors"
                            >
                                취소
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <WarningModal
                isOpen={showBudgetWarning}
                onClose={() => setShowBudgetWarning(false)}
                type="danger"
                title="[주의] 수의계약 한도 초과 안내"
                description={`선생님! 입력하신 금액은 「지방계약법」에 따라 1인 견적 수의계약이 불가능할 수 있습니다.\n\n2,000만 원 초과 시 반드시 지정정보처리장치(S2B)를 통해 공고 또는 입찰 절차를 진행해야 합니다.`}
                primaryAction={{
                    label: 'S2B 바로가기',
                    onClick: () => window.open('https://www.s2b.kr', '_blank')
                }}
            />
        </DashboardLayout>
    );
}
