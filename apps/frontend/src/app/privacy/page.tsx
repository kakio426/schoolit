import { LEGAL_TEXT } from '@/lib/constants';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white py-16 px-6 md:px-12 lg:px-24 text-slate-900">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 pb-4 border-b border-slate-200">개인정보처리방침</h1>

                <div className="space-y-8 text-sm leading-relaxed text-slate-700">
                    <section>
                        <p className="mb-4">에듀핀(Edupin)(이하 "회사")은 정보통신망 이용촉진 및 정보보호 등에 관한 법률, 개인정보보호법 등 관련 법령에 따라 이용자의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보처리방침을 수립·공개합니다.</p>
                        <p className="text-primary font-semibold text-xs">※ 본 서비스는 연구 및 베타 테스트 단계로 제공되나, 수집된 개인정보는 관련 법령에 따라 엄격히 보호됩니다.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-3">제1조 (개인정보의 처리목적)</h2>
                        <p className="mb-2">회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 것입니다.</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>회원 가입 및 관리: 회원제 서비스 이용에 따른 본인확인, 개인 식별, 가입 의사 확인, 불량회원의 부정 이용 방지 등</li>
                            <li>재화 또는 서비스 제공: 학교-강사 매칭, 채용 공고 관리, 맞춤형 추천, 행정 서류 자동 생성, 계약서 작성 지원 등</li>
                            <li>고충 처리: 민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락·통지, 처리결과 통보 등</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-3">제2조 (처리하는 개인정보 항목)</h2>
                        <p className="mb-2">회사는 회원가입, 상담, 서비스 신청 등을 위해 아래와 같은 개인정보를 수집하고 있습니다.</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>학교 회원: 담당자 성명, 교내 직위, 학교 전화번호, 휴대전화번호(인증용), 학교 이메일 주소</li>
                            <li>강사 회원: 성명, 생년월일, 성별, 주소, 휴대전화번호, 이메일 주소, 학력/경력 사항, 자격증 정보, 프로필 사진</li>
                            <li>서비스 이용 과정에서 자동 수집: IP 주소, 쿠키, 서비스 이용 기록, 기기 정보</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-3">제3조 (개인정보의 처리 및 보유기간)</h2>
                        <p className="mb-2">회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>보유 기간: 회원 탈퇴 시까지 (단, 관계 법령 위반에 따른 수사·조사 등이 진행 중인 경우에는 해당 종료 시까지)</li>
                            <li>부정이용 방지: 악성 유저의 재가입 방지를 위해 탈퇴 후 6개월간 해시(Hash)화된 식별 정보를 보관할 수 있습니다.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-3">제4조 (개인정보의 제3자 제공)</h2>
                        <p className="mb-2">회사는 이용자의 동의 없이 개인정보를 외부에 제공하지 않습니다. 단, 서비스의 핵심 기능인 '매칭'을 위해 아래와 같이 제한적으로 제공합니다.</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>제공받는 자: 매칭이 성사된 상대방 회원 (학교 ↔ 강사)</li>
                            <li>제공 목적: 채용 면접 진행, 계약서 작성, 일정 조율</li>
                            <li>제공 항목: 성명, 연락처, 프로필 정보</li>
                            <li>보유 및 이용기간: 채용 절차 종료 시까지</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-3">제5조 (개인정보의 파기)</h2>
                        <p className="mb-2">회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다. 파기 절차 및 방법은 다음과 같습니다.</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>전자적 파일 형태: 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제</li>
                            <li>종이 문서: 분쇄기로 분쇄하거나 소각</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-3">제6조 (개인정보 보호책임자)</h2>
                        <p className="mb-2">회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <p>성명: 유병주</p>
                            <p>직책: 대표 (CPO)</p>
                            <p>연락처: {LEGAL_TEXT.REPRESENTATIVE_EMAIL}</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-3">제7조 (권익침해 구제방법)</h2>
                        <p className="mb-2">정보주체는 아래의 기관에 대해 개인정보 침해에 대한 피해구제, 상담 등을 문의하실 수 있습니다.</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>개인정보침해신고센터 (privacy.kisa.or.kr / 국번없이 118)</li>
                            <li>대검찰청 사이버수사과 (www.spo.go.kr / 국번없이 1301)</li>
                            <li>경찰청 사이버수사국 (police.go.kr / 국번없이 182)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-3">제8조 (개인정보의 국외 이전)</h2>
                        <p className="mb-2">회사는 안정적인 서비스 제공을 위해 아래와 같이 개인정보를 국외로 이전하여 보관합니다.</p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse border border-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="border border-slate-200 p-2">이전받는 자</th>
                                        <th className="border border-slate-200 p-2">국가</th>
                                        <th className="border border-slate-200 p-2">항목</th>
                                        <th className="border border-slate-200 p-2">일시 및 방법</th>
                                        <th className="border border-slate-200 p-2">목적 및 기간</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="border border-slate-200 p-2">Railway Corp.</td>
                                        <td className="border border-slate-200 p-2">미국 (US)</td>
                                        <td className="border border-slate-200 p-2">서비스 이용 기록 및 저장 데이터 일체</td>
                                        <td className="border border-slate-200 p-2">네트워크를 통한 실시간 전송</td>
                                        <td className="border border-slate-200 p-2">시스템 운영 및 데이터 백업 (회원 탈퇴 시까지)</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-3">제9조 (고지의 의무)</h2>
                        <p className="mb-4">현 개인정보처리방침은 2026년 1월 10일부터 적용됩니다. 내용의 추가, 삭제 및 수정이 있을 시에는 개정 최소 7일 전부터 홈페이지의 '공지사항'을 통해 고지할 것입니다.</p>
                        <div className="text-slate-500">
                            <p>사업장 주소: 경기 용인시 수지구 용구대로 2729-5 A동 에듀핀</p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
