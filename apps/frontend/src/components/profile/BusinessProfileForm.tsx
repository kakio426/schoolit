"use client";

import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { API_BASE_URL } from '@/lib/constants';

interface BusinessProfileFormProps {
    user: any;
    token: string | null;
    onRefresh: () => void;
}

export default function BusinessProfileForm({ user, token, onRefresh }: BusinessProfileFormProps) {
    const [formData, setFormData] = useState({
        companyName: '',
        registrationNum: '',
        description: '',
        website: '',
        address: '',
        canIssueTaxInvoice: false,
        categories: [] as string[]
    });
    const [categoryInput, setCategoryInput] = useState('');
    const [registrationFile, setRegistrationFile] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user?.businessProfile) {
            setFormData({
                companyName: user.businessProfile.companyName || '',
                registrationNum: user.businessProfile.registrationNum || '',
                description: user.businessProfile.description || '',
                website: user.businessProfile.website || '',
                address: user.businessProfile.address || '',
                canIssueTaxInvoice: user.businessProfile.canIssueTaxInvoice || false,
                categories: user.businessProfile.categories || []
            });
            setRegistrationFile(user.businessProfile.registrationFile || null);
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsSaving(true);
        setMessage(null);

        try {
            await api.post('/business-profiles', formData);
            setMessage({ type: 'success', text: '프로필이 저장되었습니다.' });
            onRefresh();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || '저장에 실패했습니다.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;

        setIsUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('file', e.target.files[0]);

        try {
            const data = await api.upload<{ fileUrl: string }>('/business-profiles/registration-upload', uploadFormData);
            setRegistrationFile(data.fileUrl);
            setMessage({ type: 'success', text: '사업자등록증이 업로드되었습니다.' });
            onRefresh();
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || '파일 업로드에 실패했습니다.' });
        } finally {
            setIsUploading(false);
        }
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

                {/* Registration Certificate Upload */}
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">사업자등록증 첨부 (인증용)</label>
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-all"
                        >
                            {isUploading ? '업로드 중...' : '파일 선택'}
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                            accept=".jpg,.jpeg,.png,.pdf"
                        />
                        {registrationFile && (
                            <span className="text-xs text-primary font-medium flex items-center gap-1">
                                ✅ 업로드 완료
                                <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${registrationFile}`} target="_blank" rel="noreferrer" className="underline ml-2">보기</a>
                            </span>
                        )}
                        {!registrationFile && <span className="text-xs text-foreground-muted">JPG, PNG, PDF 지원</span>}
                    </div>
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

            {message && (
                <div className={`p-4 rounded-2xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900/50' : 'bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/50'}`}>
                    {message.text}
                </div>
            )}

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isSaving}
                    className={`px-8 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all ${isSaving ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
                >
                    {isSaving ? '저장 중...' : '프로필 저장'}
                </button>
            </div>
        </form>
    );
}
