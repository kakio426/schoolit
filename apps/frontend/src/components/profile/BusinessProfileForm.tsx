"use client";

import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { API_BASE_URL } from '@/lib/constants';
import AdminManager from './AdminManager';
import { Upload, FileText, X, Check, Building } from 'lucide-react';

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
        bankAccount: '',
        registrationFile: '' // Added back
    });
    const [categoryInput, setCategoryInput] = useState('');
    const [checklist, setChecklist] = useState(INITIAL_BUSINESS_CHECKLIST);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
                bankAccount: user.businessProfile.bankAccount || '',
                registrationFile: user.businessProfile.registrationFile || ''
            });

            if (user.businessProfile.checklist) {
                setChecklist(prev => prev.map(item => ({
                    ...item,
                    checked: user.businessProfile.checklist[item.id] || false
                })));
            }
        }
    }, [user]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Mock upload for now - In real implementation, upload to S3/Storage and get URL
        // const formData = new FormData();
        // formData.append('file', file);
        // const res = await api.upload('/upload', formData);

        // Simulating upload success
        setFormData(prev => ({ ...prev, registrationFile: `uploads/${file.name}` }));
        alert(`${file.name} 파일이 선택되었습니다. (실제 업로드 연동 필요)`);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);

        try {
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
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary"><Building className="w-6 h-6" /></div>
                    <div>
                        <h2 className="text-lg font-bold text-foreground">기본 정보</h2>
                        <p className="text-sm text-foreground-muted">업체의 기본 정보를 정확히 입력해주세요.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">업체명 (상호) <span className="text-red-500">*</span></label>
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

                {/* File Upload Section */}
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2" htmlFor="registrationFile">사업자등록증 사본</label>
                    <div className="relative group">
                        <input
                            id="registrationFile"
                            data-testid="registration-file-input"
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept=".pdf,.jpg,.png,.jpeg"
                        />
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-24 border-2 border-dashed border-border rounded-2xl flex items-center justify-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group-hover:border-primary/50"
                        >
                            {formData.registrationFile ? (
                                <>
                                    <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg"><Check className="w-5 h-5" /></div>
                                    <span className="text-sm font-bold text-emerald-600 truncate max-w-[200px]">{formData.registrationFile}</span>
                                    <span className="text-xs text-foreground-muted">(클릭하여 변경)</span>
                                </>
                            ) : (
                                <>
                                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-foreground-muted"><Upload className="w-5 h-5" /></div>
                                    <span className="text-sm text-foreground-muted font-medium">사업자등록증 파일을 이곳에 업로드하세요 (PDF, 이미지)</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* S2B Number Section */}
                <div className="p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                    <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded">S2B</span>
                            <label className="block text-sm font-bold text-slate-900 dark:text-slate-100">학교장터(S2B) 업체번호 <span className="text-[10px] font-medium text-slate-400 ml-1">(선택사항)</span></label>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <input
                            type="text"
                            name="s2bNumber"
                            value={formData.s2bNumber}
                            onChange={handleChange}
                            disabled={formData.s2bNumber === 'S2B 미가입'}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-foreground disabled:bg-slate-50 disabled:text-slate-400"
                            placeholder="예: 20240105-1234"
                        />
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.s2bNumber === 'S2B 미가입'}
                                onChange={(e) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        s2bNumber: e.target.checked ? 'S2B 미가입' : ''
                                    }));
                                }}
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">S2B 미가입 업체입니다.</span>
                        </label>
                    </div>
                </div>

                {/* Bank Account */}
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">정산 계좌 정보</label>
                    <input
                        type="text"
                        name="bankAccount"
                        value={formData.bankAccount}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-surface rounded-2xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground font-mono"
                        placeholder="예: 농협 301-1234-5678-01 (법인명)"
                    />
                </div>

                {/* Description */}
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
                            placeholder="https://"
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
                            placeholder="주소 입력"
                        />
                    </div>
                </div>

                {/* Categories */}
                <div className="pt-4 border-t border-border">
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
                    { label: '정산 계좌', value: formData.bankAccount || '(미입력)' },
                ]}
            />

            {message && (
                <div className={`p-4 rounded-2xl text-sm font-medium animate-in fade-in slide-in-from-bottom-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {message.text}
                </div>
            )}

            <div className="flex justify-end pb-20">
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
