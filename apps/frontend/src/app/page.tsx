"use client";

import Link from "next/link";
import { ArrowRight, Search, School, UserCheck, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-primary/30">
      {/* Navigation Bar */}
      <nav className="fixed w-full z-50 top-0 left-0 border-b border-white/5 bg-slate-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="School It" className="h-8 w-auto object-contain" />
            <span className="font-bold text-lg tracking-tight">School It</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              로그인
            </Link>
            <Link
              href="/auth/login"
              className="text-sm font-bold bg-white text-slate-900 px-4 py-2 rounded-full hover:bg-slate-200 transition-all active:scale-95"
            >
              시작하기
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 opacity-50"></div>

        <div className="max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-primary-300 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            2026년 학교 채용의 새로운 표준
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
            학교와 선생님을 잇는<br />
            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              가장 스마트한 방법
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            검증된 선생님 프로필부터 학교 행사 중개까지.<br />
            복잡한 채용과 매칭 프로세스를 School It에서 간편하게 해결하세요.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/browse"
              className="group w-full sm:w-auto px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              선생님 둘러보기
            </Link>
            <Link
              href="/auth/login"
              className="group w-full sm:w-auto px-8 py-4 bg-slate-800 text-white font-bold rounded-2xl border border-white/10 hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
            >
              학교 등록하기
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 px-6 bg-slate-800/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<UserCheck className="w-8 h-8 text-blue-400" />}
              title="검증된 선생님"
              description="자격증과 경력이 확인된 전문 선생님들을 쉽고 빠르게 찾아보세요."
            />
            <FeatureCard
              icon={<School className="w-8 h-8 text-purple-400" />}
              title="맞춤형 매칭"
              description="학교의 요구사항에 딱 맞는 인재를 AI 기반 매칭으로 추천해드립니다."
            />
            <FeatureCard
              icon={<ShieldCheck className="w-8 h-8 text-emerald-400" />}
              title="신뢰할 수 있는 후기"
              description="실제 근무 경험을 바탕으로 한 정성적 후기로 서로의 신뢰를 쌓아가세요."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 bg-slate-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
          <div className="mb-4 md:mb-0">
            &copy; 2026 School It. All rights reserved.
          </div>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-white transition-colors">이용약관</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">개인정보처리방침</Link>
            <a href="#" className="hover:text-white transition-colors">고객센터</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-3xl bg-slate-900 border border-white/5 hover:border-primary/50 transition-colors group">
      <div className="mb-6 p-4 rounded-2xl bg-slate-800 w-fit group-hover:bg-slate-800/80 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
