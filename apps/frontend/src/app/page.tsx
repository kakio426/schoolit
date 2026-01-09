"use client";

import Link from "next/link";
import { ArrowRight, Search, School, UserCheck, ShieldCheck } from "lucide-react";
import TutorialSection from "@/components/landing/TutorialSection";
import FooterDisclaimer from "@/components/layout/FooterDisclaimer";

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

      {/* Hero Section (Easy Guide) */}
      <div className="pt-20">
        <TutorialSection />
      </div>

      {/* Feature Grid */}
      <section className="py-24 px-6 bg-slate-800/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<UserCheck className="w-8 h-8 text-blue-400" />}
              title="준비된 선생님"
              description="상세한 경력과 자격 정보를 갖춘 전문 선생님들을 쉽고 빠르게 찾아보세요."
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
      {/* Footer */}
      <FooterDisclaimer />
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
