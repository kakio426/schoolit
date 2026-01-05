"use client";

import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { useDaumPostcodePopup } from 'react-daum-postcode';
import { School, MapPin, Users, Phone, Globe, Upload, Info } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';

interface SchoolProfileFormProps {
    user: any;
    token: string | null;
    onRefresh: () => void;
}

const SCHOOL_TYPES = [
    { value: 'ELEMENTARY', label: '초등학교' },
    { value: 'MIDDLE', label: '중학교' },
    { value: 'HIGH', label: '고등학교' },
    { value: 'SPECIAL', label: '특수학교' },
    { value: 'ALTERNATIVE', label: '대안학교' },
    { value: 'ETC', label: '기타 교육기관' }
];

export default function SchoolProfileForm({ user, token, onRefresh }: SchoolProfileFormProps) {
    const { updateSchoolProfile, isSaving } = useProfile();
    const openDaumPostcode = useDaumPostcodePopup('https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js');

    const [formData, setFormData] = useState({
        schoolName: '',
        schoolType: 'ELEMENTARY',
        address: '',
        detailAddress: '',
        phoneNumber: '',
        homepage: '',
        description: '',
        studentCount: 0,
        logoImage: '',
        tags: [] as string[]
    });

    const [tagInput, setTagInput] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user?.schoolProfile) {
            setFormData({
                schoolName: user.schoolProfile.schoolName || '',
                schoolType: user.schoolProfile.schoolType || 'ELEMENTARY',
                address: user.schoolProfile.address || '',
                detailAddress: user.schoolProfile.detailAddress || '',
                phoneNumber: user.schoolProfile.phoneNumber || '',
                homepage: user.schoolProfile.homepage || user.schoolProfile.website || '',
                description: user.schoolProfile.description || '',
                studentCount: user.schoolProfile.studentCount || 0,
                logoImage: user.schoolProfile.logoImage || '',
                tags: user.schoolProfile.tags || []
            });
        }
    }, [user]);

    const handleCompletePostcode = (data: any) => {
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.addressType === 'R') {
            if (data.bname !== '') extraAddress += data.bname;
            if (data.buildingName !== '') extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
            fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }

        setFormData(prev => ({ ...prev, address: fullAddress }));
    };

    const handleAddressSearch = () => {
        openDaumPostcode({ onComplete: handleCompletePostcode });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append('file', e.target.files[0]);

        try {
            const res = await api.upload<{ fileUrl: string }>('/users/school/logo/upload', uploadData);
            setFormData(prev => ({ ...prev, logoImage: res.fileUrl }));
            setMessage({ type: 'success', text: '로고가 업로드되었습니다.' });
        } catch (err: any) {
            setMessage({ type: 'error', text: '이미지 업로드 실패: ' + err.message });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        // Convert string inputs to correct types if needed (though controlled inputs handle it mostly)
        const payload = {
            ...formData,
            studentCount: Number(formData.studentCount)
        };

        const result = await updateSchoolProfile(payload);
        if (result.success) {
            setMessage({ type: 'success', text: '학교 프로필이 성공적으로 저장되었습니다.' });
        } else {
            setMessage({ type: 'error', text: result.error || '저장 실패' });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
            setTagInput('');
        }
    };

    const removeTag = (index: number) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== index) }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Logo Section */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-shrink-0">
                    <div
                        className="w-32 h-32 rounded-2xl bg-slate-100 dark:bg-slate-700 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors overflow-hidden relative group"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {formData.logoImage ? (
                            <img src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${formData.logoImage}`} alt="School Logo" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center p-2">
                                <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                                <span className="text-xs text-slate-500 font-medium">로고 업로드</span>
                            </div>
                        )}
                        {isUploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                    <p className="text-center mt-2 text-xs text-slate-400">권장: 1:1 비율</p>
                </div>

                <div className="flex-1 w-full space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">학교/기관명</label>
                            <input
                                type="text"
                                name="schoolName"
                                value={formData.schoolName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-slate-800 dark:text-white"
                                placeholder="예: 서울고등학교"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">학교 구분</label>
                            <div className="relative">
                                <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <select
                                    name="schoolType"
                                    value={formData.schoolType}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none text-slate-800 dark:text-white"
                                >
                                    {SCHOOL_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">한줄 소개</label>
                        <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-600 dark:text-slate-400"
                            placeholder="학교의 비전이나 자랑거리를 짧게 소개해주세요."
                        />
                    </div>
                </div>
            </div>

            {/* Scale & Details */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    상세 정보
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">전교생 수 (대략)</label>
                        <div className="relative">
                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="number"
                                name="studentCount"
                                value={formData.studentCount}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="예: 500"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">명</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">학교 태그 (특징)</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="#혁신학교 #급식맛집"
                            />
                            <button type="button" onClick={addTag} className="bg-primary text-white px-4 rounded-xl font-bold">추가</button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3 min-h-[30px]">
                            {formData.tags.map((tag, idx) => (
                                <span key={idx} className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full flex items-center gap-1">
                                    #{tag}
                                    <button type="button" onClick={() => removeTag(idx)} className="hover:text-red-500 ml-1">×</button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact & Location */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-500" />
                    위치 및 연락처
                </h3>

                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">주소</label>
                    <div className="flex gap-3 mb-3">
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            readOnly
                            onClick={handleAddressSearch}
                            className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-200 transition-colors"
                            placeholder="주소 검색을 클릭하세요"
                        />
                        <button
                            type="button"
                            onClick={handleAddressSearch}
                            className="px-6 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-colors"
                        >
                            검색
                        </button>
                    </div>
                    <input
                        type="text"
                        name="detailAddress"
                        value={formData.detailAddress}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        placeholder="상세 주소 (선택)"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">대표 전화번호</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="02-123-4567"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">홈페이지</label>
                        <div className="relative">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="url"
                                name="homepage"
                                value={formData.homepage}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            {message && (
                <div className={`p-4 rounded-2xl text-sm font-bold text-center animate-pulse ${message.type === 'success'
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Submit */}
            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={isSaving}
                    className={`px-10 py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/30 hover:bg-primary/90 hover:scale-105 transition-all ${isSaving ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
                >
                    {isSaving ? '저장 중...' : '프로필 저장하기'}
                </button>
            </div>
        </form>
    );
}
