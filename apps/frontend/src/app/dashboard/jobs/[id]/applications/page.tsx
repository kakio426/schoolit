import { useRouter } from 'next/navigation';
import ChecklistPopover from '@/components/applications/ChecklistPopover';
// ... imports

export default function JobApplicantsPage() {
    const { id } = useParams(); // jobId
    const router = useRouter();
    // ... existing state

    // Chat Logic
    const startChat = async (targetUserId: number) => {
        if (!confirm('채팅방을 개설하고 메시지를 보내시겠습니까?')) return;
        try {
            const res = await api.post<{ id: number }>('/chat/rooms', {
                targetUserId,
                jobId: Number(id)
            });
            router.push(`/dashboard/messages?room=${res.id}`);
        } catch (e: any) {
            console.error(e);
            alert(e.message || '채팅방 개설 실패');
        }
    };

    // Contract Download Logic
    const downloadContract = async (appId: number, jobType: JobType) => {
        if (!confirm('🔒 [보안 안내] 본 계약서는 참고용 초안입니다.\n실제 계약은 학교 내부 결재를 통해 진행하세요.\n\n다운로드 하시겠습니까?')) return;

        try {
            // Use fetch directly or update api wrapper to handle blobs, usually axios/fetch needs responseType: 'blob'
            // Assuming api wrapper might strictly return JSON, let's try standard fetch with auth header for blob
            const token = localStorage.getItem('token'); // or from useAuth
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/applications/${appId}/contract`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = jobType === JobType.EVENT_VENDOR ? 'completion_report.pdf' : 'teacher_contract_draft.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (e: any) {
            console.error(e);
            alert('다운로드 실패: 계약 단계가 아니거나 오류가 발생했습니다.');
        }
    };

    // ... useEffect ...

    // ... inside JSX map(app) ...
    {/* Admin Document Readiness (Visual Indicator) */ }
    <div className="mt-4 flex items-center gap-4 group/checklist relative cursor-help">
        <div className="text-xs font-bold text-foreground-muted">행정 서류 준비도</div>
        <div className="flex-1 max-w-[200px] h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
                className="h-full bg-primary transition-all"
                style={{
                    width: `${(() => {
                        const checklist = app.user?.teacherProfile?.checklist || app.user?.businessProfile?.checklist || {};
                        const items = Object.values(checklist);
                        if (items.length === 0) return 0;
                        const checked = items.filter(v => v === true).length;
                        return (checked / items.length) * 100;
                    })()}%`
                }}
            ></div>
        </div>
        <span className="text-[10px] font-bold text-primary">
            {(() => {
                const checklist = app.user?.teacherProfile?.checklist || app.user?.businessProfile?.checklist || {};
                const items = Object.values(checklist);
                if (items.length === 0) return '미준비';
                const checked = items.filter(v => v === true).length;
                return `${checked}/${items.length}`;
            })()}
        </span>

        {/* Popover on Hover */}
        <div className="hidden group-hover/checklist:block transition-all">
            <ChecklistPopover checklist={app.user?.teacherProfile?.checklist || app.user?.businessProfile?.checklist} />
        </div>
    </div>
                                </div >

        <div className="flex flex-col gap-3 min-w-[200px] justify-center">
            <div className="text-center mb-4">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(app.status)}`}>
                    {getStatusText(app.status)}
                </span>
            </div>

            {/* STATUS TRANSITIONS (unchanged logic) ... */}
            {/* PENDING -> NEXT STEP */}
            {app.status === ApplicationStatus.PENDING && (
                <>
                    <button
                        onClick={() => handleStatusClick(app.id, job?.jobType === JobType.EVENT_VENDOR ? ApplicationStatus.BIDDING : ApplicationStatus.DOCUMENT_SCREENING)}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 text-sm active:scale-95"
                    >
                        {job?.jobType === JobType.EVENT_VENDOR ? '견적 심사 진행 (업체선정)' : '서류 전형 합격'}
                    </button>
                    <button
                        onClick={() => handleStatusClick(app.id, ApplicationStatus.REJECTED)}
                        className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-red-50 hover:text-red-500 transition-all text-sm active:scale-95"
                    >
                        {job?.jobType === JobType.EVENT_VENDOR ? '미선정 (반려)' : '불합격'}
                    </button>
                </>
            )}

            {/* Always show Chat Button if not Pending/Rejected? Or even then? User asked for generally available. */}
            {/* Let's add it for everyone except maybe REJECTED or fully completed without intention? */}
            {app.status !== ApplicationStatus.REJECTED && (
                <button
                    onClick={() => app.user?.id && startChat(app.user.id)}
                    className="w-full py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-sm active:scale-95 flex items-center justify-center gap-2"
                >
                    💬 메시지 보내기
                </button>
            )}
            {/* TEACHER WORKFLOW */}
            {app.status === ApplicationStatus.DOCUMENT_SCREENING && (
                <button
                    onClick={() => handleStatusClick(app.id, ApplicationStatus.INTERVIEWING)}
                    className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20 text-sm active:scale-95"
                >
                    면접 · 시연 제안
                </button>
            )}

            {app.status === ApplicationStatus.INTERVIEWING && (
                <button
                    onClick={() => handleStatusClick(app.id, ApplicationStatus.VERIFICATION)}
                    className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 text-sm active:scale-95"
                >
                    결격사유 확인 진행
                </button>
            )}

            {app.status === ApplicationStatus.VERIFICATION && (
                <button
                    onClick={() => handleStatusClick(app.id, ApplicationStatus.HIRED)}
                    className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 text-sm active:scale-95"
                >
                    🎉 최종 채용 확정
                </button>
            )}

            {/* EVENT WORKFLOW */}
            {app.status === ApplicationStatus.BIDDING && (
                <button
                    onClick={() => handleStatusClick(app.id, ApplicationStatus.CONTRACTING)}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 text-sm active:scale-95"
                >
                    업체 선정 및 계약 진행
                </button>
            )}

            {app.status === ApplicationStatus.CONTRACTING && (
                <button
                    onClick={() => handleStatusClick(app.id, ApplicationStatus.EXECUTING)}
                    className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 text-sm active:scale-95"
                >
                    계약 체결 완료 (행사 준비)
                </button>
            )}

            {app.status === ApplicationStatus.EXECUTING && (
                <button
                    onClick={() => handleStatusClick(app.id, ApplicationStatus.PAYMENT_COMPLETED)}
                    className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all shadow-lg shadow-slate-500/20 text-sm active:scale-95"
                >
                    행사/용역 완료 (대금 지급)
                </button>
            )}


            {(app.status === ApplicationStatus.HIRED || app.status === ApplicationStatus.PAYMENT_COMPLETED || app.status === ApplicationStatus.CONTRACTING || app.status === ApplicationStatus.EXECUTING) && (
                <div className="flex flex-col gap-2 w-full">
                    <button
                        onClick={() => downloadContract(app.id, job?.jobType || JobType.TEACHER_HIRING)}
                        className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-sm active:scale-95 flex items-center justify-center gap-2"
                    >
                        📄 {job?.jobType === JobType.EVENT_VENDOR ? '완료보고서 / 검수조서' : '계약서 초안 (PDF)'}
                    </button>
// ... rest of component            <div className="mt-12 p-8 rounded-3xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 text-center">
                        <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed font-medium">
                            🛡️ <b>행정 안내 및 책임 소재</b>: 본 매칭 결과는 참고용이며, 최종 계약(S2B 등) 및 자격 서류 검증은 반드시 <b>학교 내부 결재 및 지침</b>에 따라 진행해 주세요. <br />
                            플랫폼은 베타 연구용(Research Prototype) 서비스로서 어떠한 법적 계약 대행 및 보증 책임도 지지 않습니다.
                        </p>
                        <p className="text-[10px] text-slate-400 mt-3 italic">
                            「개인정보 보호법」에 따라 지원자의 개인정보는 90일 후 자동으로 파기됩니다. 지원 서류의 관리는 학교 보안 규정을 준수해 주세요.
                        </p>
                    </div>
                </div>

            {selectedApplicant && (
                <ReviewModal
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    receiverName={selectedApplicant.user?.name || ''}
                    receiverRole={selectedApplicant.user?.role || Role.TEACHER}
                    onSubmit={async (data) => {
                        try {
                            await api.post('/reviews', {
                                jobId: parseInt(id as string),
                                receiverId: selectedApplicant.user?.id,
                                ...data
                            });
                            alert('후기 및 평가가 성공적으로 전달되었습니다! ✨');
                            fetchData();
                        } catch (e: any) {
                            console.error(e);
                            alert(e.message || '저장에 실패했습니다.');
                        }
                    }}
                />
            )}

            <UserProfileModal
                isOpen={!!viewProfileId}
                onClose={() => setViewProfileId(null)}
                userId={viewProfileId || 0}
            />

            <WarningModal
                isOpen={showTimerWarning}
                onClose={() => setShowTimerWarning(false)}
                type="warning"
                title="[권고] 공정 채용 기간 안내과"
                description={`선생님, 공고 등록 후 3일이 지나지 않았습니다.\n\n교육청에서는 공정한 채용 기회 부여를 위해 충분한 공고 게시 기간(통상 3일 이상)을 준수할 것을 권장하고 있습니다.`}
                primaryAction={{
                    label: '이해했습니다 (계속 진행)',
                    onClick: () => {
                        setShowTimerWarning(false);
                        setShowComplianceCheck(true);
                    }
                }}
            />

            <ComplianceCheck
                isOpen={showComplianceCheck}
                onClose={() => setShowComplianceCheck(false)}
                onConfirm={handleComplianceConfirmed}
                candidateName={applicants.find(a => a.id === pendingApplicantId)?.user?.name || '지원자'}
            />
        </DashboardLayout>
    );
}
