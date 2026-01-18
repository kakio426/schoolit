"use client";

import Link from "next/link";
import { ArrowRight, UserCheck, School, ShieldCheck, Bot, CheckCircle2 } from "lucide-react";
import TutorialSection from "@/components/landing/TutorialSection";
import FooterDisclaimer from "@/components/layout/FooterDisclaimer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30 overflow-x-hidden">

      {/* 1. Navigation Bar (배경 블러 효과 강화) */}
      <nav className="fixed w-full z-50 top-0 left-0 border-b border-white/5 bg-slate-950/70 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group">
            <img src="/logo.png" alt="School It" className="h-8 w-auto object-contain transition-transform group-hover:scale-105" />
            <span className="font-bold text-xl tracking-tight text-white group-hover:text-blue-100 transition-colors">School It</span>
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
              className="text-sm font-bold bg-white text-slate-950 px-5 py-2.5 rounded-full hover:bg-blue-50 transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            >
              시작하기
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. Optimized Hero Section (여백 축소 및 밀도 향상) */}
      <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 px-6 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none opacity-40 mix-blend-screen" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none opacity-20" />

        <div className="relative max-w-4xl mx-auto text-center space-y-8 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/40 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-2 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            2026년 학교 채용의 새로운 표준
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-white">
            학교와 선생님을 잇는 <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              가장 스마트한 연결
            </span>
          </h1>

          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            복잡한 서류 작업과 매칭 스트레스는 이제 그만.<br className="hidden sm:block" />
            AI 기반 매칭으로 학교는 최적의 인재를, 선생님은 최고의 기회를 찾으세요.
          </p>

          <div className="flex justify-center pt-2">
            <Link
              href="/auth/login"
              className="px-10 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-base transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 group hover:scale-105 active:scale-95"
            >
              무료로 시작하기
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Service Benefits (비율 조정: 사이즈 축소 및 정렬) */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 border-t border-white/5 mt-12 max-w-3xl mx-auto">
            <BenefitItem icon={<School className="w-4 h-4 text-blue-400" />} title="AI 맞춤 매칭" description="학교 조건에 맞는 인재 추천" />
            <BenefitItem icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />} title="자격 검증" description="자격증/경력 자동 확인" />
            <BenefitItem icon={<CheckCircle2 className="w-4 h-4 text-purple-400" />} title="서류 자동화" description="계약서/채용문서 생성" />
            <BenefitItem icon={<Bot className="w-4 h-4 text-amber-400" />} title="24시간 AI 지원" description="행정 문의 즉시 답변" />
          </div>
        </div>
      </section>

      {/* 3. Existing Tutorial Section (How it works) */}
      <div className="relative border-y border-white/5 bg-slate-900/50 backdrop-blur-sm py-12">
        <TutorialSection />
      </div>

      {/* 4. Feature Grid (Why Choose Us) */}
      <section className="py-20 px-6 relative bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-2xl md:text-4xl font-bold">모든 과정을 하나로</h2>
            <p className="text-slate-400 text-base md:text-lg">채용 공고부터 계약 체결까지, School It에서 한 번에 해결하세요.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <FeatureCard
              icon={<UserCheck className="w-5 h-5 text-blue-400" />}
              title="검증된 인재풀"
              description="상세한 경력과 자격 정보가 인증된 선생님들을 빠르게 찾아보세요."
            />
            <FeatureCard
              icon={<School className="w-5 h-5 text-purple-400" />}
              title="맞춤형 AI 매칭"
              description="학교의 요구사항을 분석하여 가장 적합한 선생님을 추천해드립니다."
            />
            <FeatureCard
              icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />}
              title="신뢰할 수 있는 평판"
              description="실제 근무 데이터를 바탕으로 한 투명한 후기 시스템을 제공합니다."
            />
            <FeatureCard
              icon={<Bot className="w-5 h-5 text-amber-400" />}
              title="AI 행정 비서"
              description="복잡한 채용 행정 절차와 문의사항을 AI가 24시간 해결해드립니다."
            />
          </div>
        </div>
      </section>

      {/* 5. Bottom CTA (마지막 설득) */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/20 rounded-[2.5rem] p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-10" />
          <div className="relative z-10 space-y-6">
            <h2 className="text-2xl md:text-4xl font-bold text-white">
              지금 바로 시작해보세요
            </h2>
            <p className="text-slate-300 text-base md:text-lg max-w-lg mx-auto">
              학교는 행정 업무를 줄이고 교육에 집중하고,<br className="hidden sm:block" />
              선생님은 더 좋은 교육 환경에서 아이들을 만날 수 있습니다.
            </p>
            <div className="flex justify-center pt-2">
              <Link
                href="/auth/signup"
                className="px-8 py-3.5 bg-white text-slate-950 rounded-full font-bold text-base hover:bg-blue-50 transition-all shadow-xl hover:scale-105 active:scale-95"
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

function BenefitItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-1.5 group cursor-default text-center">
      <div className="p-2.5 bg-slate-900 rounded-xl border border-white/5 group-hover:border-blue-500/30 transition-colors mb-1">
        {icon}
      </div>
      <span className="text-lg font-bold text-white">{title}</span>
      <span className="text-xs text-slate-500 font-medium">{description}</span>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-blue-500/30 hover:bg-slate-800/80 transition-all group duration-300 h-full flex flex-col">
      <div className="mb-4 p-3 rounded-xl bg-slate-800 w-fit group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 leading-relaxed text-sm flex-grow">
        {description}
      </p>
    </div>
  );
}
