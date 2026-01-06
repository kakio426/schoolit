"use client";

import React from 'react';
import { User, TeacherProfile } from '@/types';

interface TeacherProfileViewProps {
    user: User;
}

/**
 * Displays detailed Teacher profile information.
 * Extracted from UserProfileModal for better maintainability.
 */
export default function TeacherProfileView({ user }: TeacherProfileViewProps) {
    const profile = user.teacherProfile;
    if (!profile) return null;

    return (
        <>
            {/* Experiences */}
            <div>
                <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <span>💼</span> 경력 사항
                </h4>
                <div className="space-y-3">
                    {(!profile.experiences || profile.experiences.length === 0) ? (
                        <p className="text-foreground-muted text-sm ml-1">등록된 경력이 없습니다.</p>
                    ) : (
                        profile.experiences.map((exp, idx) => (
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
                    {(!profile.educations || profile.educations.length === 0) ? (
                        <p className="text-foreground-muted text-sm ml-1">등록된 학력이 없습니다.</p>
                    ) : (
                        profile.educations.map((edu, idx) => (
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
                        {(!profile.licenses || profile.licenses.length === 0) ? (
                            <li className="text-foreground-muted text-sm ml-1">없음</li>
                        ) : (
                            profile.licenses.map((lic, idx) => (
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
                        {(!profile.links || profile.links.length === 0) ? (
                            <li className="text-foreground-muted text-sm ml-1">없음</li>
                        ) : (
                            profile.links.map((link, idx) => (
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
    );
}
