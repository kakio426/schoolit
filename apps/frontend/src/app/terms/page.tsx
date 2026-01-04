export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white py-16 px-6 md:px-12 lg:px-24 text-slate-900">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 pb-4 border-b border-slate-200">서비스 이용약관</h1>

                <div className="space-y-8 text-sm leading-relaxed text-slate-700">
                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-3">제1조 (목적)</h2>
                        <p className="mb-2">이 약관은 에듀핀(Edupin)(이하 "회사")이 운영하는 학교-인력 매칭 플랫폼 스쿨잇(Schoolit)(이하 "서비스")을 이용함에 있어 회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
                        <p className="text-primary font-semibold">※ 본 서비스는 현재 연구 및 베타 테스트 단계로 제공되며, 정식 서비스 전환 전까지 기능의 수정이나 데이터의 초기화가 발생할 수 있습니다.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-3">제2조 (용어의 정의)</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>"서비스"란 단말기(PC, 휴대형 단말기 등)에 상관없이 회원이 이용할 수 있는 스쿨잇 및 관련 제반 서비스를 의미합니다.</li>
                            <li>"회원"이란 서비스에 접속하여 이 약관에 따라 회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 고객을 말합니다.</li>
                            <li>"학교 회원": 인력을 채용하고자 하는 교육기관 관리자</li>
                            <li>"강사 회원": 교육 서비스를 제공하고자 하는 개인 회원</li>
                            <li>"기업 회원": 전문 인력 및 용역 서비스를 제공하고자 하는 사업자 소속 회원 (행사 업체 등)</li>
                            <li>"매칭"이란 학교 회원과 강사/기업 회원이 서비스를 통해 서로를 탐색하고, 소통하며, 채용 의사를 확인하는 과정을 의미합니다.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-3">제3조 (약관의 효력 및 변경)</h2>
                        <p className="mb-2">회사는 이 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.</p>
                        <p>회사는 「전자상거래 등에서의 소비자보호에 관한 법률」 등 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-3">제4조 (서비스의 제공 및 변경)</h2>
                        <p className="mb-2">회사는 다음과 같은 업무를 수행합니다.</p>
                        <ul className="list-disc pl-5 space-y-2 mb-4">
                            <li>학교와 인력(강사/업체) 간의 정보 중개 및 매칭 플랫폼 제공</li>
                            <li>채용 관련 행정 서류(계약서 등) 자동 생성 지원 기능</li>
                            <li>채용 공고 및 프로필 등록/검색 서비스</li>
                            <li>기타 회사가 정하는 업무</li>
                        </ul>
                        <p>서비스의 유료화: 현재 본 서비스는 베타 테스트 기간으로 무료로 제공되나, 추후 회사의 정책에 따라 일부 또는 전체 기능이 유료로 전환될 수 있습니다. 유료 전환 시 회사는 최소 30일 전에 회원에게 공지합니다.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-3">제5조 (회사의 의무 및 면책)</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>중개자 지위: 회사는 학교 회원과 강사 회원 간의 거래를 중개하는 플랫폼 서비스 제공자일 뿐이며, 근로계약 또는 용역계약의 당사자가 아닙니다.</li>
                            <li>검증의 책임: 회사는 강사 회원이 등록한 정보(자격증, 경력 등)의 사실 여부를 확인하기 위해 노력하되, 그 정보의 완전성을 보장하지 않습니다. 특히 「아동·청소년의 성보호에 관한 법률」에 따른 성범죄 경력 조회 및 아동학대 관련 범죄 전력 조회의 의무는 실제 채용 주체인 '학교 회원'에게 있으며, 회사는 이를 대행하거나 보증하지 않습니다.</li>
                            <li>회사는 천재지변, 디도스(DDoS) 공격, IDC 장애 등 불가항력적인 사유로 서비스를 제공할 수 없는 경우 이에 대한 책임을 지지 않습니다.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-3">제6조 (회원의 의무)</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>회원은 서비스 이용 신청 시 사실에 기반한 정보를 입력해야 하며, 허위 정보를 등록하여 발생하는 모든 불이익에 대한 책임은 회원 본인에게 있습니다.</li>
                            <li>회원은 서비스를 통해 알게 된 상대방의 개인정보(연락처 등)를 매칭 및 채용 목적 이외의 용도로 사용하거나 제3자에게 유출해서는 안 됩니다.</li>
                            <li>학교 회원은 채용 확정 전, 관계 법령에 따라 필수적인 결격사유 조회(성범죄 경력 등)를 직접 수행해야 합니다.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-3">제7조 (알고리즘 및 노출 기준)</h2>
                        <p>회사는 회원의 편의를 위해 검색 및 추천 기능을 제공합니다. 검색 결과 및 추천 순위는 검색어 적합도, 거리(위치), 활동 이력, 리뷰 키워드 등을 종합적으로 고려한 자체 알고리즘에 의해 자동 배치되며, 부당하게 특정 회원을 차별하지 않습니다.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-3">제8조 (저작권의 귀속 및 이용제한)</h2>
                        <p className="mb-2">회사가 작성한 저작물에 대한 저작권 및 기타 지적재산권은 회사에 귀속합니다.</p>
                        <p>회원은 서비스를 이용함으로써 얻은 정보를 회사의 사전 승낙 없이 영리 목적으로 이용하거나 제3자에게 제공할 수 없습니다.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-3">제9조 (분쟁해결 및 관할법원)</h2>
                        <p>서비스 이용과 관련하여 회사와 회원 간에 발생한 분쟁에 대해서는 대한민국 법을 적용하며, 소송이 제기될 경우 회사의 본점 소재지를 관할하는 법원을 전속 관할법원으로 합니다.</p>
                    </section>

                    <div className="pt-8 border-t border-slate-100 mt-8 text-slate-500">
                        <p>공고일자: 2026년 1월 3일</p>
                        <p>시행일자: 2026년 1월 3일</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
