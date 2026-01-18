"use client";

import Link from "next/link";
import { ArrowRight, UserCheck, School, ShieldCheck, Bot, CheckCircle2, TrendingUp, Users } from "lucide-react";
import TutorialSection from "@/components/landing/TutorialSection";
import FooterDisclaimer from "@/components/layout/FooterDisclaimer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30 overflow-x-hidden">

      {/* 1. Navigation Bar (배경 블러 효과 강화) */}
      <nav className="fixed w-full z-50 top-0 left-0 border-b border-white/5 bg-slate-950/70 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer">
            <img src="/logo.png" alt="School It" className="h-8 w-auto object-contain" />
            <span className="font-bold text-xl tracking-tight text-white">School It</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="hidden md:block text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              로그인
            </Link>
            <Link
              href="/auth/login"
              className="text-sm font-bold bg-white text-slate-950 px-5 py-2.5 rounded-full hover:bg-blue-50 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              시작하기
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. New Hero Section (강렬한 인트로) */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none opacity-50 mix-blend-screen" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none opacity-30" />

        <div className="relative max-w-5xl mx-auto text-center space-y-8 z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-950/30 border border-blue-500/30 text-blue-300 text-sm font-medium mb-4 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            2026년 학교 채용의 새로운 표준
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-white">
            학교와 선생님을 잇는 <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              가장 스마트한 연결
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            복잡한 서류 작업과 매칭 스트레스는 이제 그만.<br />
            AI 기반 매칭으로 학교는 최적의 인재를, 선생님은 최고의 기회를 찾으세요.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/auth/signup?type=school"
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 group"
            >
              학교로 시작하기
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/auth/signup?type=teacher"
              className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2"
            >
              선생님으로 시작하기
            </Link>
          </div>

          {/* Trust Badges / Stats (Social Proof) */}
          <div className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/5 mt-16">
            <StatItem number="1,200+" label="등록된 선생님" icon={<Users className="w-5 h-5 text-blue-400" />} />
            <StatItem number="98%" label="매칭 성공률" icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />} />
            <StatItem number="24h" label="평균 채용 시간" icon={<TrendingUp className="w-5 h-5 text-purple-400" />} />
            <StatItem number="ZERO" label="행정 업무 부담" icon={<ShieldCheck className="w-5 h-5 text-amber-400" />} />
          </div>
        </div>
      </section>

      {/* 3. Existing Tutorial Section (How it works) */}
      {/* 배경색을 살짝 다르게 주어 섹션 구분 */}
      <div className="relative border-t border-white/5 bg-slate-900/50 backdrop-blur-sm">
        {/* TutorialSection 컴포넌트 내부의 h1, p 태그는 제거하거나 props로 제어하는 것이 좋지만, 
             일단 여기서는 TutorialSection이 '기능 시연'에 집중하도록 감싸줍니다. */}
        <TutorialSection />
      </div>

      {/* 4. Feature Grid (Why Choose Us) */}
      <section className="py-24 px-6 relative bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">모든 과정을 하나로</h2>
            <p className="text-slate-400 text-lg">채용 공고부터 계약 체결까지, School It에서 한 번에 해결하세요.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<UserCheck className="w-6 h-6 text-blue-400" />}
              title="검증된 인재풀"
              description="상세한 경력과 자격 정보가 인증된 선생님들을 빠르게 찾아보세요."
            />
            <FeatureCard
              icon={<School className="w-6 h-6 text-purple-400" />}
              title="맞춤형 AI 매칭"
              description="학교의 요구사항을 분석하여 가장 적합한 선생님을 추천해드립니다."
            />
            <FeatureCard
              icon={<ShieldCheck className="w-6 h-6 text-emerald-400" />}
              title="신뢰할 수 있는 평판"
              description="실제 근무 데이터를 바탕으로 한 투명한 후기 시스템을 제공합니다."
            />
            <FeatureCard
              icon={<Bot className="w-6 h-6 text-amber-400" />}
              title="AI 행정 비서"
              description="복잡한 채용 행정 절차와 문의사항을 AI가 24시간 해결해드립니다."
            />
          </div>
        </div>
      </section>

      {/* 5. Bottom CTA (마지막 설득) */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border border-blue-500/20 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-20" />
          <div className="relative z-10 space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold text-white">
              지금 바로 시작해보세요
            </h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              학교는 행정 업무를 줄이고 교육에 집중하고,<br />
              선생님은 더 좋은 교육 환경에서 아이들을 만날 수 있습니다.
            </p>
            <div className="flex justify-center">
              <Link
                href="/auth/signup"
                className="px-10 py-4 bg-white text-slate-950 rounded-full font-bold text-lg hover:bg-blue-50 transition-all shadow-xl hover:scale-105 active:scale-95"
              >
                무료로 시작하기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <FooterDisclaimer />
    </div>
  );
}

// --- Sub Components ---

function StatItem({ number, label, icon }: { number: string, label: string, icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-2 group cursor-default">
      <div className="p-3 bg-slate-900 rounded-2xl border border-white/5 group-hover:border-blue-500/30 transition-colors mb-2">
        {icon}
      </div>
      <span className="text-3xl md:text-4xl font-bold text-white">{number}</span>
      <span className="text-sm text-slate-500 font-medium">{label}</span>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-3xl bg-slate-900 border border-white/5 hover:border-blue-500/30 hover:bg-slate-800/50 transition-all group duration-300">
      <div className="mb-6 p-4 rounded-2xl bg-slate-800 w-fit group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed text-sm">
        {description}
      </p>
    </div>
  );
}
