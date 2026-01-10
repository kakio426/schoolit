"use client";

import { useState, useEffect } from 'react';
import { ChevronRight, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { LEGAL_TEXT } from '@/lib/constants';

interface TermsAgreementProps {
    onAgreementChange: (allRequiredAgreed: boolean) => void;
}

export default function TermsAgreement({ onAgreementChange }: TermsAgreementProps) {
    const [agreements, setAgreements] = useState({
        termsOfService: false,    // [필수] 이용약관
        privacyPolicy: false,     // [필수] 개인정보 수집 및 이용 (국외이전 포함)
        thirdParty: false,        // [필수] 제3자 제공 (매칭)
        marketing: false,         // [선택] 마케팅
    });

    const [expandedTerm, setExpandedTerm] = useState<string | null>(null);

    const allRequired = agreements.termsOfService && agreements.privacyPolicy && agreements.thirdParty;
    const allChecked = allRequired && agreements.marketing;

    useEffect(() => {
        onAgreementChange(allRequired);
    }, [allRequired, onAgreementChange]);

    const handleAllCheck = () => {
        const newState = !allChecked;
        setAgreements({
            termsOfService: newState,
            privacyPolicy: newState,
            thirdParty: newState,
            marketing: newState,
        });
    };

    const toggleAgreement = (key: keyof typeof agreements) => {
        setAgreements(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleExpand = (key: string) => {
        setExpandedTerm(prev => (prev === key ? null : key));
    };

    return (
        <div className="space-y-4 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-slate-50/50 dark:bg-slate-900/50">
            {/* 전체 동의 */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div
                    onClick={handleAllCheck}
                    className={`w-6 h-6 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${allChecked
                            ? 'bg-primary border-primary text-white'
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                        }`}
                >
                    {allChecked && <Check size={14} />}
                </div>
                <label className="font-bold text-slate-900 dark:text-white text-lg cursor-pointer select-none" onClick={handleAllCheck}>
                    약관 전체 동의
                </label>
            </div>

            {/* 개별 항목들 */}
            <div className="space-y-3">
                <TermItem
                    required
                    label="서비스 이용약관 동의"
                    checked={agreements.termsOfService}
                    onClick={() => toggleAgreement('termsOfService')}
                    onExpand={() => toggleExpand('terms')}
                    isExpanded={expandedTerm === 'terms'}
                    link="/terms"
                />

                <TermItem
                    required
                    label="개인정보 수집 및 이용 동의"
                    checked={agreements.privacyPolicy}
                    onClick={() => toggleAgreement('privacyPolicy')}
                    onExpand={() => toggleExpand('privacy')}
                    isExpanded={expandedTerm === 'privacy'}
                    subText="(필수) 국외 이전 내용 포함"
                    link="/privacy"
                />

                <TermItem
                    required
                    label="개인정보 제3자 제공 동의"
                    checked={agreements.thirdParty}
                    onClick={() => toggleAgreement('thirdParty')}
                    onExpand={() => toggleExpand('thirdParty')}
                    isExpanded={expandedTerm === 'thirdParty'}
                    subText="학교-강사 매칭을 위한 필수 제공"
                />

                <TermItem
                    required={false}
                    label="마케팅 정보 수신 동의"
                    checked={agreements.marketing}
                    onClick={() => toggleAgreement('marketing')}
                    subText="이벤트 및 맞춤형 공고 추천 알림"
                />
            </div>
        </div>
    );
}

function TermItem({ required, label, checked, onClick, subText, link, onExpand, isExpanded }: any) {
    return (
        <div className="group">
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 cursor-pointer flex-1" onClick={onClick}>
                    <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${checked
                            ? 'bg-primary border-primary text-white'
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                        }`}>
                        {checked && <Check size={12} />}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm text-slate-900 dark:text-slate-100 select-none">
                            <span className={`font-bold mr-1 ${required ? 'text-primary' : 'text-slate-500'}`}>
                                {required ? '[필수]' : '[선택]'}
                            </span>
                            {label}
                        </span>
                        {subText && <span className="text-xs text-slate-500 mt-0.5">{subText}</span>}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {onExpand && (
                        <button onClick={onExpand} className="text-slate-400 hover:text-slate-600 p-1">
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                    )}
                    {link && (
                        <a href={link} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-600 p-1">
                            <ChevronRight size={18} />
                        </a>
                    )}
                </div>
            </div>

            {/* 상세 내용 (Accordion) */}
            {isExpanded && (
                <div className="mt-2 ml-8 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-h-40 overflow-y-auto custom-scrollbar">
                    {label.includes('제3자') ? (
                        <ThirdPartyContent />
                    ) : label.includes('수집') ? (
                        <PrivacySummaryContent />
                    ) : (
                        <TermsSummaryContent />
                    )}
                </div>
            )}
        </div>
    );
}

// 요약된 약관 컨텐츠 컴포넌트들
function ThirdPartyContent() {
    return (
        <div className="space-y-2">
            <p className="font-bold">1. 제공받는 자</p>
            <p>서비스 내 매칭된 상대방 (학교 ↔ 강사)</p>
            <p className="font-bold mt-2">2. 제공 목적</p>
            <p>채용 심사, 면접 진행, 계약 체결, 전자서명</p>
            <p className="font-bold mt-2">3. 제공 항목</p>
            <p>성명, 연락처, 프로필/경력 정보</p>
            <p className="font-bold mt-2">4. 보유 기간</p>
            <p>채용 절차 종료 시까지 (최장 180일)</p>
        </div>
    );
}

function PrivacySummaryContent() {
    return (
        <div className="space-y-2">
            <p>회사는 서비스 제공을 위해 최소한의 개인정보를 수집합니다.</p>
            <p className="font-bold mt-2">1. 수집 항목</p>
            <p>이름, 이메일, 휴대전화번호, (선택) 자격/경력정보</p>
            <p className="font-bold mt-2">2. 국외 이전 안내</p>
            <p>안정적인 서비스 운영을 위해 데이터가 AWS 및 Railway(미국) 서버에 보관됩니다.</p>
            <p>- 이전되는 정보: 서비스 이용 기록 및 저장된 데이터 일체</p>
            <p>- 이전 목적: 클라우드 서버 운영 및 데이터 백업</p>
        </div>
    );
}

function TermsSummaryContent() {
    return (
        <div className="space-y-2">
            <p>본 서비스는 학교와 강사를 연결하는 중개 플랫폼입니다.</p>
            <p>- 회사는 매칭의 당사자가 아니며, 실제 채용 계약의 책임은 학교와 강사에게 있습니다.</p>
            <p>- 모든 행정 절차는 관계 법령을 준수해야 합니다.</p>
        </div>
    );
}
