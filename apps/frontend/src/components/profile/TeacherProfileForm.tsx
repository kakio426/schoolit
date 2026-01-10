"use client";

import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { useProfile } from '@/hooks/useProfile';
import AdminManager from './AdminManager';
// SecureUploader removed - using text-only approach
import {
    User, MapPin, BookOpen, GraduationCap, Briefcase, Link as LinkIcon,
    Plus, Trash2, X, Save, Upload, CheckCircle, Award, AlertTriangle
} from 'lucide-react';
import { SUBJECT_GROUPS, KOREA_REGIONS, MAJOR_CITIES } from '@/lib/data';

interface TeacherProfileFormProps {
    user: any;
    token: string | null;
    onRefresh: () => void;
}

const TARGET_GRADES = [
    { value: 'ELEMENTARY_LOW', label: '초등 저학년 (1-3학년)' },
    { value: 'ELEMENTARY_HIGH', label: '초등 고학년 (4-6학년)' },
    { value: 'MIDDLE', label: '중학교' },
    { value: 'HIGH', label: '고등학교' },
];

const TEACHER_TYPES = [
    { value: 'REGULAR', label: '정규교사' },
    { value: 'FIXED_TERM', label: '기간제 교사' },
    { value: 'PART_TIME', label: '시간제 교사' },
    { value: 'AFTER_SCHOOL', label: '방과후 강사' },
    { value: 'CARE', label: '돌봄 강사' },
    { value: 'NEULBOM', label: '늘봄 강사' },
    { value: 'OTHER', label: '기타' }
];

const INITIAL_CHECKLIST = [
    { id: 'bankAccount', label: '통장 사본 (본인 명의)', description: '급여 지급을 검토하기 위해 확인합니다.', checked: false },
    { id: 'degree', label: '최종 학력 증명서', description: '강사 자격 요건 확인용.', checked: false },
    { id: 'license', label: '교원/강사 자격증', description: '원본 대조가 필요합니다.', checked: false },
    { id: 'criminalRecord', label: '성범죄 경력 조회 동의서', description: '아동/청소년 보호법에 의거 필수.', checked: false },
    { id: 'physicalExam', label: '채용 신체검사서', description: '최근 1년 이내 발급분.', checked: false },
    { id: 'drugTest', label: '마약/향정신성 약물 검사결과', description: '검사 결과 통보서 지참.', checked: false },
    { id: 'tbCheck', label: '잠복결핵 검진 확인서', description: '학교/유치원 근무 시 필수.', checked: false },
];

// INITIAL_SECURE_FILES removed - no file upload

export default function TeacherProfileForm({ user, token, onRefresh }: TeacherProfileFormProps) {
    const {
        updateTeacherProfile,
        addTeacherExperience, removeTeacherExperience,
        addTeacherEducation, removeTeacherEducation,
        addTeacherLink, removeTeacherLink,
        addTeacherLicense, removeTeacherLicense,
        isSaving
    } = useProfile();

    // Basic Info State
    const [basicInfo, setBasicInfo] = useState({
        bio: '',
        subjects: [] as string[],
        regions: [] as string[],
        targetGrades: [] as string[],
        profileImage: '',
        bankAccount: '',
        phone: '',
        teacherType: '',
        isSearchable: false
    });

    // Checklist & Documents
    const [checklist, setChecklist] = useState(INITIAL_CHECKLIST);
    // secureFiles state removed - no file upload

    // Inputs
    const [inputs, setInputs] = useState({
        subject: '',
        region: ''
    });

    // Form Visibility States
    const [showAddExp, setShowAddExp] = useState(false);
    const [showAddEdu, setShowAddEdu] = useState(false);
    const [showAddLink, setShowAddLink] = useState(false);
    const [showAddLicense, setShowAddLicense] = useState(false);

    // New Item States
    const [newExp, setNewExp] = useState({ title: '', organization: '', startDate: '', endDate: '', isCurrent: false, description: '' });
    const [newEdu, setNewEdu] = useState({ schoolName: '', degree: 'Bachelor', major: '', graduationStatus: 'GRADUATED', startDate: '', endDate: '' });
    const [newLink, setNewLink] = useState({ title: '', url: '' });
    const [newLicense, setNewLicense] = useState({ name: '', issuer: '', date: '' });

    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user?.teacherProfile) {
            setBasicInfo({
                bio: user.teacherProfile.bio || '',
                subjects: user.teacherProfile.subjects || [],
                regions: user.teacherProfile.regions || [],
                targetGrades: user.teacherProfile.targetGrades || [],
                profileImage: user.teacherProfile.profileImage || '',
                bankAccount: user.teacherProfile.bankAccount || '',
                phone: user.phone || '',
                teacherType: user.teacherProfile.teacherType || '',
                isSearchable: user.teacherProfile.isSearchable || false
            });

            // Restore Checklist
            if (user.teacherProfile.checklist) {
                setChecklist(prev => prev.map(item => ({
                    ...item,
                    checked: user.teacherProfile.checklist[item.id] || false
                })));
            }

            // Secure Files restore removed - using text-only approach
        }
    }, [user]);

    // --- Handlers ---

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append('file', e.target.files[0]);

        try {
            const res = await api.upload<{ fileUrl: string }>('/users/teacher/image/upload', uploadData);
            setBasicInfo(prev => ({ ...prev, profileImage: res.fileUrl }));
            setMessage({ type: 'success', text: '이미지가 업로드되었습니다. 저장 버튼을 눌러 확정하세요.' });
        } catch (err: any) {
            setMessage({ type: 'error', text: '이미지 업로드 실패: ' + err.message });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveBasic = async (e?: React.FormEvent) => {
        e?.preventDefault();

        // Convert checklist array to object
        const checklistObj = checklist.reduce((acc, item) => ({ ...acc, [item.id]: item.checked }), {});

        const result = await updateTeacherProfile({
            bio: basicInfo.bio,
            subjects: basicInfo.subjects,
            regions: basicInfo.regions,
            profileImage: basicInfo.profileImage,
            targetGrades: basicInfo.targetGrades,
            bankAccount: basicInfo.bankAccount,
            phone: basicInfo.phone,
            teacherType: basicInfo.teacherType,
            isSearchable: basicInfo.isSearchable,
            checklist: checklistObj
        });

        if (result.success) {
            setMessage({ type: 'success', text: '기본 정보와 체크리스트가 저장되었습니다.' });
        } else {
            setMessage({ type: 'error', text: '저장 실패: ' + result.error });
        }
    };

    const handleChecklistChange = (id: string, checked: boolean) => {
        setChecklist(prev => prev.map(item => item.id === id ? { ...item, checked } : item));
    };

    // handleSecureUpload and handleSecureRemove removed - using text-only approach

    // --- List Managers (Same as before) ---
    const addSubject = () => {
        if (inputs.subject.trim() && !basicInfo.subjects.includes(inputs.subject.trim())) {
            setBasicInfo(prev => ({ ...prev, subjects: [...prev.subjects, inputs.subject.trim()] }));
            setInputs(prev => ({ ...prev, subject: '' }));
        }
    };
    const removeSubject = (idx: number) => {
        setBasicInfo(prev => ({ ...prev, subjects: prev.subjects.filter((_, i) => i !== idx) }));
    };
    const addRegion = () => {
        if (inputs.region.trim() && !basicInfo.regions.includes(inputs.region.trim())) {
            setBasicInfo(prev => ({ ...prev, regions: [...prev.regions, inputs.region.trim()] }));
            setInputs(prev => ({ ...prev, region: '' }));
        }
    };
    const removeRegion = (idx: number) => {
        setBasicInfo(prev => ({ ...prev, regions: prev.regions.filter((_, i) => i !== idx) }));
    };
    const toggleGrade = (grade: string) => {
        setBasicInfo(prev => {
            const exists = prev.targetGrades.includes(grade);
            return {
                ...prev,
                targetGrades: exists ? prev.targetGrades.filter(g => g !== grade) : [...prev.targetGrades, grade]
            };
        });
    };

    // --- Sub-resource Handlers (Same as before) ---
    const submitExp = async () => {
        if (!newExp.title || !newExp.organization || !newExp.startDate) return;
        const res = await addTeacherExperience(newExp);
        if (res.success) {
            setShowAddExp(false);
            setNewExp({ title: '', organization: '', startDate: '', endDate: '', isCurrent: false, description: '' });
        } else {
            setMessage({ type: 'error', text: res.error });
        }
    };
    const submitEdu = async () => {
        if (!newEdu.schoolName || !newEdu.startDate) return;
        const res = await addTeacherEducation(newEdu);
        if (res.success) {
            setShowAddEdu(false);
            setNewEdu({ schoolName: '', degree: 'Bachelor', major: '', graduationStatus: 'GRADUATED', startDate: '', endDate: '' });
        } else {
            setMessage({ type: 'error', text: res.error });
        }
    };
    const submitLink = async () => {
        if (!newLink.title || !newLink.url) return;
        const res = await addTeacherLink(newLink);
        if (res.success) {
            setShowAddLink(false);
            setNewLink({ title: '', url: '' });
        } else {
            setMessage({ type: 'error', text: res.error });
        }
    };
    const submitLicense = async () => {
        if (!newLicense.name || !newLicense.date) return;
        const res = await addTeacherLicense(newLicense);
        if (res.success) {
            setShowAddLicense(false);
            setNewLicense({ name: '', issuer: '', date: '' });
        } else {
            setMessage({ type: 'error', text: res.error });
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header Message */}
            {message && (
                <div className={`p-4 rounded-2xl text-sm font-bold text-center fixed bottom-6 left-1/2 -translate-x-1/2 z-50 shadow-xl ${message.type === 'success'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-red-600 text-white'
                    }`}>
                    {message.text}
                    <button onClick={() => setMessage(null)} className="ml-4 text-white/80 hover:text-white">✕</button>
                </div>
            )}

            {/* Administrative Documents Section (AdminManager) - Repositioned to top for high visibility */}
            <div className="w-full">
                <AdminManager
                    type="TEACHER"
                    items={checklist}
                    onCheck={handleChecklistChange}
                    quickData={[
                        { label: '지원자 성명', value: user?.name || '' },
                        { label: '연락처', value: basicInfo.phone || '⚠️ 입력 필요 (아래에서 입력)' },
                        { label: '정산 계좌', value: basicInfo.bankAccount || '⚠️ 입력 필요 (아래에서 입력)' },
                    ]}
                />
            </div>

            {/* 1. Basic Info & Photo */}
            <div className="bg-surface p-8 rounded-3xl border border-border shadow-sm flex flex-col md:flex-row gap-8">
                {/* Photo Upload */}
                <div className="flex-shrink-0 flex flex-col items-center gap-3">
                    <div
                        className="w-32 h-32 rounded-full overflow-hidden bg-background relative group cursor-pointer border-4 border-surface shadow-lg"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {basicInfo.profileImage ? (
                            <img src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${basicInfo.profileImage}`} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-foreground-muted">
                                <User className="w-12 h-12" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Upload className="text-white w-6 h-6" />
                        </div>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                    <span className="text-xs font-bold text-foreground-muted">프로필 사진 변경</span>
                </div>

                {/* Info Fields */}
                <div className="flex-1 space-y-6">
                    {/* 1. Phone Input Field - Moved to top for visibility */}
                    <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 shadow-sm animate-pulse-subtle">
                        <label className="flex items-center gap-2 text-sm font-bold text-primary mb-2">
                            <span>📞</span> 연락처 (학교 공개용 - 필수 입력)
                        </label>
                        <input
                            type="text"
                            value={basicInfo.phone}
                            onChange={(e) => setBasicInfo(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full px-4 py-3 bg-surface rounded-xl border-2 border-primary/30 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-lg text-foreground"
                            placeholder="예: 010-1234-5678"
                            id="phone-input"
                        />
                        <p className="text-[11px] text-foreground-muted mt-2 font-medium">* 학교 담당자가 강사님께 성범죄 조회 동의 요청이나 면접 안내를 드릴 때 사용됩니다.</p>
                    </div>

                    {/* Teacher Type & Privacy Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <div>
                            <label className="block text-sm font-bold text-foreground mb-2">교사 유형</label>
                            <select
                                value={basicInfo.teacherType}
                                onChange={(e) => setBasicInfo(prev => ({ ...prev, teacherType: e.target.value }))}
                                className="w-full px-4 py-3 bg-surface border border-input-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground appearance-none cursor-pointer"
                            >
                                <option value="" disabled>선택해주세요</option>
                                {TEACHER_TYPES.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-foreground mb-2">인재찾기 공개 설정</label>
                            <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${basicInfo.isSearchable
                                ? 'bg-primary/5 border-primary shadow-sm'
                                : 'bg-surface border-input-border hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}>
                                <input
                                    type="checkbox"
                                    checked={basicInfo.isSearchable}
                                    onChange={(e) => setBasicInfo(prev => ({ ...prev, isSearchable: e.target.checked }))}
                                    className="mt-1 w-5 h-5 accent-primary"
                                />
                                <div className="flex-1">
                                    <span className={`block font-bold text-sm ${basicInfo.isSearchable ? 'text-primary' : 'text-foreground'}`}>
                                        {basicInfo.isSearchable ? '내 프로필 공개 중' : '내 프로필 공개하기'}
                                    </span>
                                    <span className="text-xs text-foreground-muted block mt-1 leading-relaxed">
                                        체크하면 학교 담당자가 '인재 찾기' 목록에서 선생님을 검색하고 스카웃 제안을 보낼 수 있습니다. <br />
                                        <strong className={basicInfo.isSearchable ? 'text-primary' : 'text-foreground-muted'}>
                                            {basicInfo.isSearchable ? '현재 학교에 노출되고 있습니다.' : '현재 비공개 상태입니다 (기본).'}
                                        </strong>
                                    </span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* bankAccount Input Field */}
                        <div>
                            <label className="block text-sm font-bold text-foreground mb-2">정산용 계좌 정보 (정보 입력)</label>
                            <input
                                type="text"
                                value={basicInfo.bankAccount}
                                onChange={(e) => setBasicInfo(prev => ({ ...prev, bankAccount: e.target.value }))}
                                className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                                placeholder="예: 농협 302-1234-5678 (본인 명의)"
                            />
                            <p className="text-[10px] text-foreground-muted mt-2">*실제 서류(통장사본)은 행정실에 직접 제출하셔야 합니다.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-foreground mb-2">자기소개 (한 줄 요약)</label>
                            <input
                                type="text"
                                value={basicInfo.bio}
                                onChange={(e) => setBasicInfo(prev => ({ ...prev, bio: e.target.value }))}
                                className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                                placeholder="예: 10년 경력의 코딩 전문 강사입니다."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-foreground mb-2">가능 과목</label>
                            <div className="flex gap-2 mb-2">
                                <select
                                    value={inputs.subject}
                                    onChange={e => setInputs(p => ({ ...p, subject: e.target.value }))}
                                    className="flex-1 px-3 py-2 bg-zinc-900 border border-white/[0.08] rounded-xl text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                    <option value="">과목 선택</option>
                                    {SUBJECT_GROUPS.map((group) => (
                                        <optgroup key={group.name} label={group.name}>
                                            {group.subjects.map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={addSubject}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded-xl font-black text-lg transition-all active:scale-95"
                                >
                                    +
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {basicInfo.subjects.map((s, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold rounded-lg flex items-center gap-2">
                                        {s} <button onClick={() => removeSubject(i)} className="hover:text-white transition-colors">×</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-foreground mb-2">활동 지역</label>
                            <div className="flex flex-col gap-2 mb-2">
                                <div className="flex gap-2">
                                    <select
                                        value={inputs.region.split(' ')[0] || ''}
                                        onChange={e => setInputs(p => ({ ...p, region: e.target.value }))}
                                        className="flex-1 px-3 py-2 bg-zinc-900 border border-white/[0.08] rounded-xl text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500/20"
                                    >
                                        <option value="">시/도</option>
                                        {MAJOR_CITIES.map(city => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={inputs.region.split(' ')[1] || ''}
                                        onChange={e => {
                                            const sido = inputs.region.split(' ')[0];
                                            setInputs(p => ({ ...p, region: `${sido} ${e.target.value}` }));
                                        }}
                                        disabled={!inputs.region.split(' ')[0]}
                                        className="flex-1 px-3 py-2 bg-zinc-900 border border-white/[0.08] rounded-xl text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-30"
                                    >
                                        <option value="">시/군/구</option>
                                        {inputs.region.split(' ')[0] && KOREA_REGIONS[inputs.region.split(' ')[0]]?.map(gu => (
                                            <option key={gu} value={gu}>{gu}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={addRegion}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 rounded-xl font-black text-lg transition-all active:scale-95"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {basicInfo.regions.map((r, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg flex items-center gap-2">
                                        {r} <button onClick={() => removeRegion(i)} className="hover:text-white transition-colors">×</button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-foreground mb-3">선호 학년 (중복 선택 가능)</label>
                        <div className="flex flex-wrap gap-3">
                            {TARGET_GRADES.map(grade => (
                                <button
                                    key={grade.value}
                                    type="button"
                                    onClick={() => toggleGrade(grade.value)}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${basicInfo.targetGrades.includes(grade.value)
                                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                        : 'bg-surface text-foreground-muted border-border hover:bg-surface-hover'
                                        }`}
                                >
                                    {grade.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button onClick={() => handleSaveBasic()} className="px-6 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2">
                            <Save className="w-4 h-4" />
                            기본 정보 및 체크리스트 저장
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. Experience Section */}
            <div className="section-card border-l-purple-500">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold flex items-center gap-2"><Briefcase className="w-5 h-5 text-purple-500" /> 경력 사항</h3>
                    <button onClick={() => setShowAddExp(!showAddExp)} className="text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors">+ 추가</button>
                </div>

                {showAddExp && (
                    <div className="mb-6 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in zoom-in-95">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input placeholder="직위/역할 (예: 수학 강사)" className="w-full px-4 py-3 rounded-xl outline-none text-sm bg-input-bg border border-input-border text-foreground placeholder:text-foreground-muted focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={newExp.title} onChange={e => setNewExp({ ...newExp, title: e.target.value })} />
                            <input placeholder="소속 (학교/학원명)" className="w-full px-4 py-3 rounded-xl outline-none text-sm bg-input-bg border border-input-border text-foreground placeholder:text-foreground-muted focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={newExp.organization} onChange={e => setNewExp({ ...newExp, organization: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input type="date" className="w-full px-4 py-3 rounded-xl outline-none text-sm max-w-[200px] bg-input-bg border border-input-border text-foreground placeholder:text-foreground-muted focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all has-[value]:text-foreground" value={newExp.startDate} onChange={e => setNewExp({ ...newExp, startDate: e.target.value })} />
                            <input type="date" className="w-full px-4 py-3 rounded-xl outline-none text-sm max-w-[200px] bg-input-bg border border-input-border text-foreground placeholder:text-foreground-muted focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50" disabled={newExp.isCurrent} value={newExp.endDate} onChange={e => setNewExp({ ...newExp, endDate: e.target.value })} />
                            <label className="flex items-center gap-2 text-sm font-bold cursor-pointer text-foreground">
                                <input type="checkbox" checked={newExp.isCurrent} onChange={e => setNewExp({ ...newExp, isCurrent: e.target.checked })} className="w-5 h-5 accent-primary" />
                                현재 재직 중
                            </label>
                        </div>
                        <textarea
                            placeholder="상세 업무 내용"
                            className="w-full px-4 py-3 rounded-xl outline-none text-sm resize-none bg-input-bg border border-input-border text-foreground placeholder:text-foreground-muted focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            rows={4}
                            value={newExp.description}
                            onChange={e => setNewExp({ ...newExp, description: e.target.value })}
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowAddExp(false)} className="px-4 py-2 text-sm text-foreground-muted font-bold hover:bg-surface-hover rounded-lg transition-colors">취소</button>
                            <button
                                onClick={submitExp}
                                disabled={!newExp.title || !newExp.organization || !newExp.startDate}
                                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                등록
                            </button>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {user?.teacherProfile?.experiences?.map((exp: any) => (
                        <div key={exp.id} className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700 group">
                            <div className="mt-1 w-2 h-2 rounded-full bg-purple-400 flex-shrink-0" />
                            <div className="flex-1">
                                <h4 className="font-bold text-foreground">{exp.title}</h4>
                                <p className="text-sm text-foreground-muted">{exp.organization}</p>
                                <p className="text-xs text-slate-400 mt-1">
                                    {exp.startDate.split('T')[0]} ~ {exp.isCurrent ? '현재' : exp.endDate?.split('T')[0]}
                                </p>
                                {exp.description && <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 whitespace-pre-wrap">{exp.description}</p>}
                            </div>
                            <button onClick={() => removeTeacherExperience(exp.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    ))}
                    {(!user?.teacherProfile?.experiences || user.teacherProfile.experiences.length === 0) && (
                        <p className="text-center text-slate-400 text-sm py-4">등록된 경력이 없습니다.</p>
                    )}
                </div>
            </div>

            {/* 3. Education Section */}
            <div className="section-card border-l-blue-500">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold flex items-center gap-2"><GraduationCap className="w-5 h-5 text-blue-500" /> 학력 사항</h3>
                    <button onClick={() => setShowAddEdu(!showAddEdu)} className="text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors">+ 추가</button>
                </div>

                {showAddEdu && (
                    <div className="mb-6 p-6 bg-surface rounded-2xl border border-border space-y-4 animate-in fade-in zoom-in-95">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input placeholder="학교명" className="w-full px-4 py-3 rounded-xl outline-none text-sm bg-input-bg border border-input-border text-foreground placeholder:text-foreground-muted focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={newEdu.schoolName} onChange={e => setNewEdu({ ...newEdu, schoolName: e.target.value })} />
                            <input placeholder="전공" className="w-full px-4 py-3 rounded-xl outline-none text-sm bg-input-bg border border-input-border text-foreground placeholder:text-foreground-muted focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={newEdu.major} onChange={e => setNewEdu({ ...newEdu, major: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <select className="w-full px-4 py-3 rounded-xl outline-none text-sm bg-input-bg border border-input-border text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={newEdu.degree} onChange={e => setNewEdu({ ...newEdu, degree: e.target.value })}>
                                <option value="HighSchool">고등학교</option>
                                <option value="Bachelor">학사 (대학교)</option>
                                <option value="Master">석사 (대학원)</option>
                                <option value="Doctor">박사</option>
                            </select>
                            <select className="w-full px-4 py-3 rounded-xl outline-none text-sm bg-input-bg border border-input-border text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={newEdu.graduationStatus} onChange={e => setNewEdu({ ...newEdu, graduationStatus: e.target.value })}>
                                <option value="GRADUATED">졸업</option>
                                <option value="ATTENDING">재학 중</option>
                                <option value="LEAVE">휴학/중퇴</option>
                            </select>

                            <input type="date" className="w-full px-4 py-3 rounded-xl outline-none text-sm max-w-[200px] bg-input-bg border border-input-border text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={newEdu.startDate} onChange={e => setNewEdu({ ...newEdu, startDate: e.target.value })} />
                            <input type="date" className="w-full px-4 py-3 rounded-xl outline-none text-sm max-w-[200px] bg-input-bg border border-input-border text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={newEdu.endDate || ''} onChange={e => setNewEdu({ ...newEdu, endDate: e.target.value })} placeholder="졸업일 (선택)" />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowAddEdu(false)} className="px-4 py-2 text-sm text-foreground-muted font-bold hover:bg-surface-hover rounded-lg transition-colors">취소</button>
                            <button
                                onClick={submitEdu}
                                disabled={!newEdu.schoolName || !newEdu.startDate}
                                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                등록
                            </button>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {user?.teacherProfile?.educations?.map((edu: any) => (
                        <div key={edu.id} className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700 group">
                            <div className="mt-1 w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                            <div className="flex-1">
                                <h4 className="font-bold text-foreground">{edu.schoolName}</h4>
                                <p className="text-sm text-foreground-muted">{edu.degree} {edu.major && `- ${edu.major}`}</p>
                                <p className="text-xs text-slate-400 mt-1">
                                    {edu.startDate.split('T')[0]} ~
                                </p>
                            </div>
                            <button onClick={() => removeTeacherEducation(edu.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    ))}
                    {(!user?.teacherProfile?.educations || user.teacherProfile.educations.length === 0) && (
                        <p className="text-center text-slate-400 text-sm py-4">등록된 학력이 없습니다.</p>
                    )}
                </div>
            </div>

            {/* 4. Links Section */}
            <div className="section-card border-l-slate-500">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold flex items-center gap-2"><LinkIcon className="w-5 h-5 text-slate-500" /> 포트폴리오 / 링크</h3>
                    <button onClick={() => setShowAddLink(!showAddLink)} className="text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors">+ 추가</button>
                </div>
                <div className="!bg-blue-50 dark:!bg-blue-900/20 !border-2 !border-blue-200 dark:!border-blue-700 p-4 rounded-xl mb-6">
                    <p className="text-sm text-blue-900 dark:text-blue-200 font-medium">
                        💡 <strong>가이드:</strong> 유튜브(수업 시연 영상), 블로그(교육 철학), 인스타그램(활동 기록) 등 선생님을 어필할 수 있는 링크를 자유롭게 추가해주세요.
                    </p>
                </div>

                {showAddLink && (
                    <div className="mb-6 p-6 bg-surface rounded-2xl border border-border space-y-4 animate-in fade-in zoom-in-95">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input placeholder="제목 (예: 수업 시연 영상)" className="w-full px-4 py-3 rounded-xl outline-none text-sm bg-input-bg border border-input-border text-foreground placeholder:text-foreground-muted focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={newLink.title} onChange={e => setNewLink({ ...newLink, title: e.target.value })} />
                            <input placeholder="URL (https://...)" className="w-full px-4 py-3 rounded-xl outline-none text-sm bg-input-bg border border-input-border text-foreground placeholder:text-foreground-muted focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={newLink.url} onChange={e => setNewLink({ ...newLink, url: e.target.value })} />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowAddLink(false)} className="px-4 py-2 text-sm text-foreground-muted font-bold hover:bg-surface-hover rounded-lg transition-colors">취소</button>
                            <button onClick={submitLink} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-hover transition-all">등록</button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user?.teacherProfile?.links?.map((link: any) => (
                        <div key={link.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700 group">
                            <a href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 flex-1 hover:text-primary transition-colors truncate">
                                <LinkIcon className="w-4 h-4 text-slate-400" />
                                <span className="font-bold text-sm truncate">{link.title}</span>
                            </a>
                            <button onClick={() => removeTeacherLink(link.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><X className="w-4 h-4" /></button>
                        </div>
                    ))}
                    {(!user?.teacherProfile?.links || user.teacherProfile.links.length === 0) && (
                        <p className="col-span-full text-center text-slate-400 text-sm py-4">등록된 링크가 없습니다.</p>
                    )}
                </div>
            </div>

            {/* 5. Licenses Section */}
            <div className="section-card border-l-amber-500">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold flex items-center gap-2"><Award className="w-5 h-5 text-amber-500" /> 자격증 및 면허 (정보 입력)</h3>
                    <button onClick={() => setShowAddLicense(!showAddLicense)} className="text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors">+ 추가</button>
                </div>

                {showAddLicense && (
                    <div className="mb-6 p-6 bg-surface rounded-2xl border border-border space-y-4 animate-in fade-in zoom-in-95">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input placeholder="자격증 명칭 (예: 정보처리기사)" className="w-full px-4 py-3 rounded-xl outline-none text-sm bg-input-bg border border-input-border text-foreground placeholder:text-foreground-muted focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={newLicense.name} onChange={e => setNewLicense({ ...newLicense, name: e.target.value })} />
                            <input placeholder="발급 기관 (예: 한국산업인력공단)" className="w-full px-4 py-3 rounded-xl outline-none text-sm bg-input-bg border border-input-border text-foreground placeholder:text-foreground-muted focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={newLicense.issuer} onChange={e => setNewLicense({ ...newLicense, issuer: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <input type="month" className="w-full px-4 py-3 rounded-xl outline-none text-sm max-w-[200px] bg-input-bg border border-input-border text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={newLicense.date} onChange={e => setNewLicense({ ...newLicense, date: e.target.value })} />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowAddLicense(false)} className="px-4 py-2 text-sm text-foreground-muted font-bold hover:bg-surface-hover rounded-lg transition-colors">취소</button>
                            <button onClick={submitLicense} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-hover transition-all">등록</button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user?.teacherProfile?.licenses?.map((lic: any) => (
                        <div key={lic.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700 group">
                            <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                <Award className="w-8 h-8 text-amber-200 flex-shrink-0" />
                                <div className="min-w-0">
                                    <h4 className="font-bold text-sm truncate">{lic.name}</h4>
                                    <p className="text-xs text-slate-500 truncate">{lic.issuer} • {lic.date}</p>
                                </div>
                            </div>
                            <button onClick={() => removeTeacherLicense(lic.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    ))}
                    {(!user?.teacherProfile?.licenses || user.teacherProfile.licenses.length === 0) && (
                        <p className="col-span-full text-center text-slate-400 text-sm py-4">등록된 자격증이 없습니다.</p>
                    )}
                </div>
            </div>

            {/* Disclaimer */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-4 items-start md:items-center text-slate-500 dark:text-slate-400">
                <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                <div className="text-xs leading-relaxed">
                    <strong className="block text-slate-700 dark:text-slate-300 mb-1">면책 조항 (BETA)</strong>
                    본 프로필의 모든 정보(경력, 학력, 자격증 등)는 선생님이 직접 작성한 내용으로, 에듀핀은 그 진위 여부를 보증하지 않습니다.
                    채용 과정에서 학교 측의 <strong>원본 서류 대조가 반드시 필요합니다.</strong> 본 서비스는 교육 정보화 연구를 위한 베타 버전입니다.
                </div>
            </div>

            <style jsx>{`
                .input-std:focus {
                    @apply ring-2 ring-primary/20 border-primary;
                }
                /* Higher contrast for section cards */
                .section-card {
                    @apply bg-surface p-8 rounded-3xl border border-border shadow-sm transition-all hover:shadow-md border-l-4;
                }
                @keyframes pulse-subtle {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.85; }
                }
                .animate-pulse-subtle {
                    animation: pulse-subtle 3s ease-in-out infinite;
                }
            `}</style>
        </div >
    );
}
