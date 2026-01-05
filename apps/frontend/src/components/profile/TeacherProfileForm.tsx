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
        bankAccount: ''
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
                bankAccount: user.teacherProfile.bankAccount || ''
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
                        { label: '연락처', value: user?.phone || '(비공개)' },
                        { label: '정산 계좌', value: basicInfo.bankAccount || '(미등록)' },
                    ]}
                />
            </div>

            {/* 1. Basic Info & Photo */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-8">
                {/* Photo Upload */}
                <div className="flex-shrink-0 flex flex-col items-center gap-3">
                    <div
                        className="w-32 h-32 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700 relative group cursor-pointer border-4 border-white dark:border-slate-600 shadow-lg"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {basicInfo.profileImage ? (
                            <img src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${basicInfo.profileImage}`} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <User className="w-12 h-12" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Upload className="text-white w-6 h-6" />
                        </div>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                    <span className="text-xs font-bold text-slate-500">프로필 사진 변경</span>
                </div>

                {/* Info Fields */}
                <div className="flex-1 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">자기소개</label>
                        <textarea
                            value={basicInfo.bio}
                            onChange={(e) => setBasicInfo(prev => ({ ...prev, bio: e.target.value }))}
                            rows={3}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                            placeholder="선생님의 강점과 교육 철학을 짧게 소개해주세요."
                        />
                    </div>
                    {/* bankAccount Input Field */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">정산용 계좌 정보 (정보 입력)</label>
                        <input
                            type="text"
                            value={basicInfo.bankAccount}
                            onChange={(e) => setBasicInfo(prev => ({ ...prev, bankAccount: e.target.value }))}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="예: 농협 302-1234-5678 (본인 명의)"
                        />
                        <p className="text-[10px] text-slate-400 mt-2">*실제 서류(통장사본)은 행정실에 직접 제출하셔야 합니다.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">가능 과목</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    value={inputs.subject}
                                    onChange={e => setInputs(p => ({ ...p, subject: e.target.value }))}
                                    onKeyPress={e => e.key === 'Enter' && addSubject()}
                                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-sm"
                                    placeholder="예: 코딩, 드론"
                                />
                                <button type="button" onClick={addSubject} className="bg-slate-200 dark:bg-slate-700 px-3 rounded-lg font-bold text-sm">+</button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {basicInfo.subjects.map((s, i) => (
                                    <span key={i} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-md flex items-center gap-1">
                                        {s} <button onClick={() => removeSubject(i)}>×</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">활동 지역</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    value={inputs.region}
                                    onChange={e => setInputs(p => ({ ...p, region: e.target.value }))}
                                    onKeyPress={e => e.key === 'Enter' && addRegion()}
                                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-sm"
                                    placeholder="예: 서울 강남구"
                                />
                                <button type="button" onClick={addRegion} className="bg-slate-200 dark:bg-slate-700 px-3 rounded-lg font-bold text-sm">+</button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {basicInfo.regions.map((s, i) => (
                                    <span key={i} className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-md flex items-center gap-1">
                                        {s} <button onClick={() => removeRegion(i)}>×</button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">선호 학년 (중복 선택 가능)</label>
                        <div className="flex flex-wrap gap-3">
                            {TARGET_GRADES.map(grade => (
                                <button
                                    key={grade.value}
                                    type="button"
                                    onClick={() => toggleGrade(grade.value)}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${basicInfo.targetGrades.includes(grade.value)
                                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
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
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold flex items-center gap-2"><Briefcase className="w-5 h-5 text-purple-500" /> 경력 사항</h3>
                    <button onClick={() => setShowAddExp(!showAddExp)} className="text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors">+ 추가</button>
                </div>

                {showAddExp && (
                    <div className="mb-6 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in zoom-in-95">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input placeholder="직위/역할 (예: 수학 강사)" className="input-std" value={newExp.title} onChange={e => setNewExp({ ...newExp, title: e.target.value })} />
                            <input placeholder="소속 (학교/학원명)" className="input-std" value={newExp.organization} onChange={e => setNewExp({ ...newExp, organization: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input type="date" className="input-std" value={newExp.startDate} onChange={e => setNewExp({ ...newExp, startDate: e.target.value })} />
                            <input type="date" className="input-std" disabled={newExp.isCurrent} value={newExp.endDate} onChange={e => setNewExp({ ...newExp, endDate: e.target.value })} />
                            <label className="flex items-center gap-2 text-sm font-bold">
                                <input type="checkbox" checked={newExp.isCurrent} onChange={e => setNewExp({ ...newExp, isCurrent: e.target.checked })} className="w-5 h-5" />
                                현재 재직 중
                            </label>
                        </div>
                        <textarea placeholder="상세 업무 내용" className="input-std" value={newExp.description} onChange={e => setNewExp({ ...newExp, description: e.target.value })} />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowAddExp(false)} className="px-4 py-2 text-sm text-slate-500 font-bold">취소</button>
                            <button onClick={submitExp} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold">등록</button>
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
                                {exp.description && <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{exp.description}</p>}
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
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold flex items-center gap-2"><GraduationCap className="w-5 h-5 text-blue-500" /> 학력 사항</h3>
                    <button onClick={() => setShowAddEdu(!showAddEdu)} className="text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors">+ 추가</button>
                </div>

                {showAddEdu && (
                    <div className="mb-6 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in zoom-in-95">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input placeholder="학교명" className="input-std" value={newEdu.schoolName} onChange={e => setNewEdu({ ...newEdu, schoolName: e.target.value })} />
                            <input placeholder="전공" className="input-std" value={newEdu.major} onChange={e => setNewEdu({ ...newEdu, major: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <select className="input-std" value={newEdu.degree} onChange={e => setNewEdu({ ...newEdu, degree: e.target.value })}>
                                <option value="HighSchool">고등학교</option>
                                <option value="Bachelor">학사 (대학교)</option>
                                <option value="Master">석사 (대학원)</option>
                                <option value="Doctor">박사</option>
                            </select>
                            <select className="input-std" value={newEdu.graduationStatus} onChange={e => setNewEdu({ ...newEdu, graduationStatus: e.target.value })}>
                                <option value="GRADUATED">졸업</option>
                                <option value="ATTENDING">재학 중</option>
                                <option value="LEAVE">휴학/중퇴</option>
                            </select>
                            <input type="date" className="input-std" value={newEdu.startDate} onChange={e => setNewEdu({ ...newEdu, startDate: e.target.value })} />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowAddEdu(false)} className="px-4 py-2 text-sm text-slate-500 font-bold">취소</button>
                            <button onClick={submitEdu} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold">등록</button>
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
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold flex items-center gap-2"><LinkIcon className="w-5 h-5 text-slate-500" /> 포트폴리오 / 링크</h3>
                    <button onClick={() => setShowAddLink(!showAddLink)} className="text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors">+ 추가</button>
                </div>

                {showAddLink && (
                    <div className="mb-6 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in zoom-in-95">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input placeholder="제목 (예: 수업 시연 영상)" className="input-std" value={newLink.title} onChange={e => setNewLink({ ...newLink, title: e.target.value })} />
                            <input placeholder="URL (https://...)" className="input-std" value={newLink.url} onChange={e => setNewLink({ ...newLink, url: e.target.value })} />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowAddLink(false)} className="px-4 py-2 text-sm text-slate-500 font-bold">취소</button>
                            <button onClick={submitLink} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold">등록</button>
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
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold flex items-center gap-2"><Award className="w-5 h-5 text-amber-500" /> 자격증 및 면허 (정보 입력)</h3>
                    <button onClick={() => setShowAddLicense(!showAddLicense)} className="text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors">+ 추가</button>
                </div>

                {showAddLicense && (
                    <div className="mb-6 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in zoom-in-95">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input placeholder="자격증 명칭 (예: 정보처리기사)" className="input-std" value={newLicense.name} onChange={e => setNewLicense({ ...newLicense, name: e.target.value })} />
                            <input placeholder="발급 기관 (예: 한국산업인력공단)" className="input-std" value={newLicense.issuer} onChange={e => setNewLicense({ ...newLicense, issuer: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <input type="month" className="input-std" value={newLicense.date} onChange={e => setNewLicense({ ...newLicense, date: e.target.value })} />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowAddLicense(false)} className="px-4 py-2 text-sm text-slate-500 font-bold">취소</button>
                            <button onClick={submitLicense} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold">등록</button>
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
                .input-std {
                    @apply w-full px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm;
                }
            `}</style>
        </div >
    );
}
