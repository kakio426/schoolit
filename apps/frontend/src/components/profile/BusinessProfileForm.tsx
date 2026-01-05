"use client";

import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { API_BASE_URL } from '@/lib/constants';
import AdminManager from './AdminManager';

const INITIAL_BUSINESS_CHECKLIST = [
    { id: 'bizRegistration', label: '사업자등록증 사본', description: '계약 시 사본 제출 필수.', checked: false },
    { id: 'fourInsurances', label: '4대보험 완납증명서', description: '대금 지급 전 확인용.', checked: false },
    { id: 'taxPayment', label: '국세/지방세 완납증명서', description: '체납 사실이 없어야 합니다.', checked: false },
    { id: 'safetyPlan', label: '안전보건관리 계획서', description: '중대재해처벌법 관련 필수.', checked: false },
];

interface BusinessProfileFormProps {
    user: any;
    token: string | null;
    onRefresh: () => void;
}

export default function BusinessProfileForm({ user, token, onRefresh }: BusinessProfileFormProps) {
    const [formData, setFormData] = useState({
        companyName: '',
        registrationNum: '',
        s2bNumber: '',
        description: '',
        website: '',
        address: '',
        canIssueTaxInvoice: false,
        categories: [] as string[],
        bankAccount: ''
    });
    const [categoryInput, setCategoryInput] = useState('');
    // registrationFile state removed
    const [checklist, setChecklist] = useState(INITIAL_BUSINESS_CHECKLIST);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (user?.businessProfile) {
            setFormData({
                companyName: user.businessProfile.companyName || '',
                registrationNum: user.businessProfile.registrationNum || '',
                s2bNumber: user.businessProfile.s2bNumber || '',
                description: user.businessProfile.description || '',
                website: user.businessProfile.website || '',
                address: user.businessProfile.address || '',
                canIssueTaxInvoice: user.businessProfile.canIssueTaxInvoice || false,
                categories: user.businessProfile.categories || [],
                bankAccount: user.businessProfile.bankAccount || ''
            });

            if (user.businessProfile.checklist) {
                setChecklist(prev => prev.map(item => ({
                    ...item,
                    checked: user.businessProfile.checklist[item.id] || false
                })));
            }
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsSaving(true);
        setMessage(null);

        try {
            try {
                // Convert checklist array to object
                const checklistObj = checklist.reduce((acc, item) => ({ ...acc, [item.id]: item.checked }), {});

                await api.post('/business-profiles', { ...formData, checklist: checklistObj });
                setMessage({ type: 'success', text: '프로필이 저장되었습니다.' });
                onRefresh();
            } catch (error: any) {
                setMessage({ type: 'error', text: error.message || '저장에 실패했습니다.' });
            } finally {
                setIsSaving(false);
            }
        };

        // handleFileUpload removed

        const handleChecklistChange = (id: string, checked: boolean) => {
            setChecklist(prev => prev.map(item => item.id === id ? { ...item, checked } : item));
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value, type } = e.target;
            const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
            setFormData(prev => ({ ...prev, [name]: val }));
        };

        const addCategory = () => {
            if (categoryInput.trim() && !formData.categories.includes(categoryInput.trim())) {
                setFormData(prev => ({
                    ...prev,
                    categories: [...prev.categories, categoryInput.trim()]
                }));
                setCategoryInput('');
            }
        };

        const removeCategory = (index: number) => {
            setFormData(prev => ({
                ...prev,
                categories: prev.categories.filter((_, i) => i !== index)
            }));
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-surface p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">업체명 (상호)</label>
                            <input
                                type="text"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-surface rounded-2xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground"
                                placeholder="예: 에듀핀"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">사업자등록번호 (선택)</label>
                            <input
                                type="text"
                                name="registrationNum"
                                value={formData.registrationNum}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-surface rounded-2xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground"
                                placeholder="예: 123-45-67890"
                            />
                        </div>
                    </div>

                    {/* S2B Number Section */}
                    <div className="p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded">S2B</span>
                            <label className="block text-sm font-bold text-slate-900 dark:text-slate-100">학교장터(S2B) 업체번호</label>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                            행정실의 원활한 계약 처리를 위해 S2B에 등록된 업체번호를 입력해주세요.
                        </p>
                        <input
                            type="text"
                            name="s2bNumber"
                            value={formData.s2bNumber}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-foreground"
                            placeholder="예: 20240105-1234 (S2B 업체번호)"
                        />
                    </div>

                    {/* Bank Account Section */}
                    <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">정산 계좌 정보 (정보 입력)</label>
                        <input
                            type="text"
                            name="bankAccount"
                            value={formData.bankAccount}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground text-sm"
                            placeholder="예: 농협 301-1234-5678-01 (법인/개인사업자 명의)"
                        />
                        <p className="text-[10px] text-slate-400 mt-2">*실제 통장사본은 학교 행정실 요청 시 오프라인으로 제출해 주세요.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">업체 소개</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={5}
                            className="w-full px-4 py-3 bg-surface rounded-2xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none text-foreground"
                            placeholder="업체의 주요 서비스와 강점을 소개해주세요."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">웹사이트 주소</label>
                            <input
                                type="url"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-surface rounded-2xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground"
                                placeholder="https://example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">사업장 주소</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-surface rounded-2xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground"
                                placeholder="예: 서울특별시 강남구..."
                            />
                        </div>
                    </div>

                    {/* Tax Invoice & Categories */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3 mb-6">
                            <input
                                type="checkbox"
                                id="canIssueTaxInvoice"
                                name="canIssueTaxInvoice"
                                checked={formData.canIssueTaxInvoice}
                                onChange={handleChange}
                                className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                            />
                            <label htmlFor="canIssueTaxInvoice" className="text-sm font-bold text-foreground">
                                세금계산서 발행 가능 여부
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">주요 서비스 카테고리</label>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    value={categoryInput}
                                    onChange={(e) => setCategoryInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                                    className="flex-1 px-4 py-2 bg-surface rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground text-sm"
                                    placeholder="예: 무인항공기, 코딩, 스포츠체험"
                                />
                                <button
                                    type="button"
                                    onClick={addCategory}
                                    className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold"
                                >
                                    추가
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.categories.map((cat, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20">
                                        {cat}
                                        <button type="button" onClick={() => removeCategory(idx)} className="hover:text-red-500">×</button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <AdminManager
                    type="BUSINESS"
                    items={checklist}
                    onCheck={handleChecklistChange}
                    quickData={[
                        { label: '사업자등록번호', value: formData.registrationNum || '(미입력)' },
                        { label: 'S2B 업체번호', value: formData.s2bNumber || '(미입력)' },
                        { label: '사업자 계좌', value: formData.bankAccount || '(미입력)' },
                        { label: '업체명', value: formData.companyName || '' },
                    ]}
                />

                {
                    message && (
                        <div className={`p-4 rounded-2xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900/50' : 'bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/50'}`}>
                            {message.text}
                        </div>
                    )
                }

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className={`px-8 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all ${isSaving ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
                    >
                        {isSaving ? '저장 중...' : '프로필 저장'}
                    </button>
                </div>
            </form >
        );
    }
