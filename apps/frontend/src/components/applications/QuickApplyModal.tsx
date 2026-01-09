"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, FileUp, CheckCircle, Paperclip, User, Mail, Phone, Briefcase, Award } from 'lucide-react';
import { api } from '@/lib/api';

interface ProfilePreview {
    name: string;
    email: string;
    phone?: string;
    subjects?: string[];
    experience?: string;
    certifications?: string[];
    s2bNumber?: string;
    companyName?: string;
}

interface QuickApplyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    jobType: 'TEACHER_HIRING' | 'EVENT_VENDOR';
    jobTitle: string;
}

export default function QuickApplyModal({
    isOpen,
    onClose,
    onSubmit,
    jobType,
    jobTitle,
}: QuickApplyModalProps) {
    const [message, setMessage] = useState('');
    const [cost, setCost] = useState('');
    const [contact, setContact] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profile, setProfile] = useState<ProfilePreview | null>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch user profile when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchProfilePreview();
        }
    }, [isOpen]);

    const fetchProfilePreview = async () => {
        setIsLoadingProfile(true);
        try {
            const endpoint = jobType === 'TEACHER_HIRING' ? '/teacher-profile/me' : '/business-profile/me';
            const data = await api.get<any>(endpoint);
            if (jobType === 'TEACHER_HIRING') {
                setProfile({
                    name: data.user?.name || '(이름 없음)',
                    email: data.user?.email || '',
                    phone: data.user?.phone,
                    subjects: data.subjects,
                    experience: data.experience,
                    certifications: data.certifications,
                });
            } else {
                setProfile({
                    name: data.user?.name || '(담당자명 없음)',
                    email: data.user?.email || '',
                    phone: data.user?.phone,
                    companyName: data.companyName,
                    s2bNumber: data.s2bNumber,
                });
            }
        } catch (e) {
            console.error('Failed to fetch profile preview', e);
        } finally {
            setIsLoadingProfile(false);
        }
    };

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleSubmit = async () => {
        if (!message.trim()) {
            alert('메시지를 입력해주세요.');
            return;
        }

        if (jobType === 'EVENT_VENDOR' && (!cost || !contact)) {
            alert('가견적과 담당자 연락처를 모두 입력해주세요.');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                message,
                cost: jobType === 'EVENT_VENDOR' ? Number(cost.replace(/[^0-9]/g, '')) : undefined,
                contactPhone: jobType === 'EVENT_VENDOR' ? contact : undefined,
                // In a real app, you would upload the file to S3 and send the URL
                attachmentUrl: selectedFile ? `temp_storage/${selectedFile.name}` : undefined,
            });
            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/10 relative">
                {/* Header */}
                <div className="p-8 pb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-lg">Quick Application</span>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <h3 className="text-2xl font-black text-foreground leading-tight">{jobTitle}</h3>
                    <p className="text-sm text-foreground-muted mt-2 font-medium">지원에 필요한 정보만 간결하게 입력해 주세요.</p>
                </div>

                {/* Body */}
                <div className="p-8 pt-4 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {/* Profile Preview Section */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-border animate-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center gap-2 mb-3">
                            <User className="w-4 h-4 text-primary" />
                            <span className="text-xs font-black text-foreground-muted uppercase">전송될 프로필 정보</span>
                        </div>
                        {isLoadingProfile ? (
                            <div className="flex items-center justify-center py-4">
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-primary"></div>
                            </div>
                        ) : profile ? (
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-foreground">{profile.name}</span>
                                    <span className="text-foreground-muted">{profile.email}</span>
                                </div>
                                {profile.phone && (
                                    <div className="flex items-center gap-1.5 text-foreground-muted">
                                        <Phone className="w-3 h-3" /> {profile.phone}
                                    </div>
                                )}
                                {jobType === 'TEACHER_HIRING' && profile.subjects && profile.subjects.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {profile.subjects.map((s: string) => (
                                            <span key={s} className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded">{s}</span>
                                        ))}
                                    </div>
                                )}
                                {jobType === 'EVENT_VENDOR' && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <Briefcase className="w-3 h-3 text-indigo-500" />
                                        <span className="font-bold text-foreground">{profile.companyName || '(회사명 미입력)'}</span>
                                        {profile.s2bNumber && (
                                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 text-xs font-bold rounded flex items-center gap-1">
                                                <Award className="w-3 h-3" /> S2B 등록
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-xs text-foreground-muted">프로필 정보를 불러올 수 없습니다.</p>
                        )}
                    </div>

                    {jobType === 'EVENT_VENDOR' && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-foreground-muted uppercase ml-1">가견적 (KRW)</label>
                                    <input
                                        type="text"
                                        value={cost}
                                        onChange={(e) => setCost(e.target.value)}
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-black text-primary text-lg"
                                        placeholder="예: 1,500,000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-foreground-muted uppercase ml-1">담당자 연락처</label>
                                    <input
                                        type="text"
                                        value={contact}
                                        onChange={(e) => setContact(e.target.value)}
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                                        placeholder="010-XXXX-XXXX"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-foreground-muted uppercase ml-1">제안/견적서 파일</label>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileChange}
                                    accept=".pdf,.jpg,.png"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`w-full h-20 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-1 transition-all ${selectedFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-border bg-slate-50/50 hover:bg-slate-100 hover:border-primary/50'}`}
                                >
                                    {selectedFile ? (
                                        <>
                                            <div className="flex items-center gap-2 text-emerald-600 font-bold">
                                                <CheckCircle className="w-4 h-4" /> {selectedFile.name}
                                            </div>
                                            <div className="text-[10px] text-emerald-500/70">파일이 정상적으로 선택되었습니다.</div>
                                        </>
                                    ) : (
                                        <>
                                            <FileUp className="w-6 h-6 text-foreground-muted" />
                                            <div className="text-sm font-bold text-foreground-muted">PDF 또는 이미지 업로드</div>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-black text-foreground-muted uppercase ml-1">
                            {jobType === 'EVENT_VENDOR' ? '상세 제안 내용' : '간단한 인사말'}
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={
                                jobType === 'EVENT_VENDOR'
                                    ? "행사 구성 요약 및 업체의 강점을 입력해 주세요."
                                    : "안녕하세요! 해당 공고에 지원하고자 합니다. 프로필 확인 부탁드립니다."
                            }
                            className="w-full h-40 px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-border rounded-[28px] outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all leading-relaxed font-medium"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 pt-0 flex gap-4">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1 py-5 bg-primary text-white rounded-2xl font-black text-lg shadow-2xl shadow-primary/30 hover:bg-primary-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {isSubmitting ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                        ) : (
                            <>
                                <Send className="w-5 h-5" /> 지원/입찰서 제출하기
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
