"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { User } from '@/types';
import { Role } from '@/lib/constants';

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: number;
}

export default function UserProfileModal({ isOpen, onClose, userId }: UserProfileModalProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen && userId) {
            fetchProfile();
        }
    }, [isOpen, userId]);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const data = await api.get<User>(`/users/${userId}/profile`);
            setUser(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-surface w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[32px] shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-700 flex flex-col">

                {/* Header */}
                <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-start bg-surface sticky top-0 z-10">
                    <h2 className="text-2xl font-bold text-foreground">상세 프로필</h2>
                    <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                        <span className="text-2xl">×</span>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                            <p className="text-foreground-muted animate-pulse">프로필 정보를 불러오는 중...</p>
                        </div>
                    ) : !user ? (
                        <div className="text-center py-20 text-foreground-muted">
                            사용자 정보를 찾을 수 없습니다.
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Identity Section */}
                            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                                <div className="w-24 h-24 rounded-[2rem] bg-slate-100 dark:bg-slate-800 ring-4 ring-white dark:ring-slate-700 shadow-lg overflow-hidden flex items-center justify-center text-4xl shrink-0">
                                    {(user.teacherProfile?.profileImage || user.schoolProfile?.logoImage) ? (
                                        <img
                                            src={user.teacherProfile?.profileImage || user.schoolProfile?.logoImage}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span>{(user.role === Role.BUSINESS ? '🏢' : user.role === Role.SCHOOL ? '🏫' : '👨‍🏫')}</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-col md:flex-row items-center md:items-start gap-2 mb-2">
                                        <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                                            {user.role === Role.BUSINESS ? user.businessProfile?.companyName : user.name}
                                            {user.role === Role.TEACHER && <span className="text-base font-normal text-foreground-muted hidden md:inline">선생님</span>}
                                        </h3>
                                        {user.teacherProfile?.isVerified && (
                                            <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-md border border-blue-100 dark:border-blue-800">신원인증됨</span>
                                        )}
                                        {user.businessProfile?.s2bNumber && (
                                            <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[10px] font-bold rounded-md border border-purple-100 dark:border-purple-800">S2B 등록업체</span>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                                        {user.role === Role.TEACHER && user.teacherProfile?.subjects.map(s => (
                                            <span key={s} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold">{s}</span>
                                        ))}
                                        {user.role === Role.BUSINESS && user.businessProfile?.categories.map(c => (
                                            <span key={c} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold">{c}</span>
                                        ))}
                                    </div>

                                    {/* Bio / Description */}
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-sm text-foreground-muted leading-relaxed whitespace-pre-wrap text-left">
                                        {user.teacherProfile?.bio || user.businessProfile?.description || user.schoolProfile?.description || '소개글이 없습니다.'}
                                    </div>
                                </div>
                            </div>

                            {/* TEACHER SPECIFIC */}
                            {user.role === Role.TEACHER && user.teacherProfile && (
                                <>
                                    {/* Experiences */}
                                    <div>
                                        <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                            <span>💼</span> 경력 사항
                                        </h4>
                                        <div className="space-y-3">
                                            {(!user.teacherProfile.experiences || user.teacherProfile.experiences.length === 0) ? (
                                                <p className="text-foreground-muted text-sm ml-1">등록된 경력이 없습니다.</p>
                                            ) : (
                                                user.teacherProfile.experiences.map((exp: any, idx: number) => (
                                                    <div key={idx} className="flex gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                        <div className="w-1 min-h-full bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                                                        <div>
                                                            <div className="font-bold text-foreground">{exp.title}</div>
                                                            <div className="text-sm text-primary font-medium">{exp.organization}</div>
                                                            <div className="text-xs text-foreground-muted mt-1">
                                                                {exp.startDate} ~ {exp.isCurrent ? '현재' : exp.endDate}
                                                            </div>
                                                            {exp.description && <p className="text-sm text-slate-500 mt-2">{exp.description}</p>}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Education */}
                                    <div>
                                        <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                            <span>🎓</span> 학력
                                        </h4>
                                        <div className="space-y-3">
                                            {(!user.teacherProfile.educations || user.teacherProfile.educations.length === 0) ? (
                                                <p className="text-foreground-muted text-sm ml-1">등록된 학력이 없습니다.</p>
                                            ) : (
                                                user.teacherProfile.educations.map((edu: any, idx: number) => (
                                                    <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-surface">
                                                        <div className="text-2xl">🏫</div>
                                                        <div>
                                                            <div className="font-bold text-foreground">{edu.schoolName}</div>
                                                            <div className="text-sm text-slate-500">{edu.degree} {edu.major && `(${edu.major})`} | {edu.graduationStatus === 'GRADUATED' ? '졸업' : '재학/수료'}</div>
                                                            <div className="text-xs text-foreground-muted mt-0.5">{edu.startDate} ~ {edu.endDate || '현재'}</div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Licenses & Links */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                                <span>🎫</span> 자격증
                                            </h4>
                                            <ul className="space-y-2">
                                                {(!user.teacherProfile.licenses || user.teacherProfile.licenses.length === 0) ? (
                                                    <li className="text-foreground-muted text-sm ml-1">없음</li>
                                                ) : (
                                                    user.teacherProfile.licenses.map((lic: any, idx: number) => (
                                                        <li key={idx} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                                            <span className="font-medium text-sm text-foreground">{lic.name}</span>
                                                            <span className="text-xs text-slate-400">{lic.issuer}</span>
                                                        </li>
                                                    ))
                                                )}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                                <span>🔗</span> 링크/포트폴리오
                                            </h4>
                                            <ul className="space-y-2">
                                                {(!user.teacherProfile.links || user.teacherProfile.links.length === 0) ? (
                                                    <li className="text-foreground-muted text-sm ml-1">없음</li>
                                                ) : (
                                                    user.teacherProfile.links.map((link: any, idx: number) => (
                                                        <a key={idx} href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 hover:bg-blue-100 transition-colors group">
                                                            <span className="text-blue-500 text-sm">🔗</span>
                                                            <span className="font-bold text-sm text-blue-700 dark:text-blue-400 group-hover:underline truncate">{link.title}</span>
                                                        </a>
                                                    ))
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* BUSINESS SPECIFIC */}
                            {user.role === Role.BUSINESS && user.businessProfile && (
                                <>
                                    {/* Business Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                            <div className="text-sm text-slate-500 mb-1">사업자정보</div>
                                            <div className="font-bold text-foreground">{user.businessProfile.companyName}</div>
                                            <div className="text-xs text-foreground-muted mt-1">등록번호: {user.businessProfile.registrationNum || '미입력'}</div>
                                            <div className="text-xs text-foreground-muted">S2B 번호: {user.businessProfile.s2bNumber || '-'}</div>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                            <div className="text-sm text-slate-500 mb-1">연락처/웹사이트</div>
                                            <div className="flex flex-col gap-1">
                                                {user.businessProfile.website && (
                                                    <a href={user.businessProfile.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm font-medium truncate">
                                                        🌐 {user.businessProfile.website}
                                                    </a>
                                                )}
                                                <div className="text-sm text-foreground">{user.businessProfile.address || '주소 미입력'}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Portfolios */}
                                    <div>
                                        <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                            <span>📂</span> 포트폴리오
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {(!user.businessProfile.portfolios || user.businessProfile.portfolios.length === 0) ? (
                                                <p className="text-foreground-muted text-sm ml-1 col-span-2">등록된 포트폴리오가 없습니다.</p>
                                            ) : (
                                                user.businessProfile.portfolios.map((pf: any, idx: number) => (
                                                    <div key={idx} className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video bg-slate-100">
                                                        {pf.images && pf.images.length > 0 ? (
                                                            <img src={pf.images[0]} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt={pf.title} />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
                                                        )}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                                                            <div className="text-white font-bold">{pf.title}</div>
                                                            {pf.description && <div className="text-white/80 text-xs line-clamp-1">{pf.description}</div>}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 md:p-6 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/30 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-foreground font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}
