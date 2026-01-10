"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import StandardCard from '@/components/ui/StandardCard';
import { useAuth } from '@/contexts/AuthContext';

// 타입 정의 (백엔드 응답 구조에 맞게 수정 필요)
interface DashboardData {
  stats: {
    activeJobs?: number;
    pendingApplications?: number;
    unreadMessages?: number;
    totalContracts?: number;
    // ... 기타 통계
  };
  recentActivities: any[];
  notices: any[];
}

interface DashboardClientProps {
  initialData: DashboardData;
}

export default function DashboardClient({ initialData }: DashboardClientProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { stats, recentActivities } = initialData;

  // Role에 따른 웰컴 메시지
  const getWelcomeMessage = () => {
    switch (user?.role) {
      case 'SCHOOL': return '오늘도 좋은 선생님을 찾아볼까요?';
      case 'TEACHER': return '새로운 수업 기회가 기다리고 있어요!';
      case 'BUSINESS': return '성공적인 행사 파트너가 되어주세요.';
      default: return '환영합니다!';
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            대시보드
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {getWelcomeMessage()}
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-3">
          {user?.role === 'SCHOOL' && (
            <button
              onClick={() => router.push('/dashboard/jobs/new')}
              className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-primary/20 active:scale-95"
            >
              + 공고 등록하기
            </button>
          )}
          {user?.role === 'TEACHER' && (
            <button
              onClick={() => router.push('/dashboard/jobs')}
              className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-primary/20 active:scale-95"
            >
              🔍 공고 찾기
            </button>
          )}
        </div>
      </div>

      {/* 2. Stats Grid (서버에서 받은 데이터 바로 사용) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="진행 중인 공고" 
          value={stats.activeJobs || 0} 
          icon="📋" 
          color="blue"
        />
        <StatCard 
          label="받은 지원서" 
          value={stats.pendingApplications || 0} 
          icon="📨" 
          color="green"
        />
        <StatCard 
          label="읽지 않은 메시지" 
          value={stats.unreadMessages || 0} 
          icon="💬" 
          color="yellow"
        />
        <StatCard 
          label="완료된 계약" 
          value={stats.totalContracts || 0} 
          icon="🤝" 
          color="purple"
        />
      </div>

      {/* 3. Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            최근 활동
          </h2>
          {recentActivities && recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map((activity: any, idx: number) => (
                <StandardCard key={idx} className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xl">
                    📌
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{activity.title || '활동 내역'}</p>
                    <p className="text-sm text-slate-500">{activity.description || '상세 내용이 없습니다.'}</p>
                  </div>
                  <div className="ml-auto text-xs text-slate-400">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </div>
                </StandardCard>
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400">
              아직 최근 활동 내역이 없습니다.
            </div>
          )}
        </div>

        {/* Side Widgets (e.g., Notice, Calendar) */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            알림 & 공지
          </h2>
          <StandardCard className="p-5 space-y-4">
             <div className="flex items-start gap-3 pb-4 border-b border-slate-100 dark:border-slate-700">
                <span className="text-primary font-bold">New</span>
                <p className="text-sm text-slate-600 dark:text-slate-300">스쿨잇 서비스 이용 약관이 개정되었습니다.</p>
             </div>
             <div className="flex items-start gap-3">
                <span className="text-slate-400 font-bold">Tip</span>
                <p className="text-sm text-slate-600 dark:text-slate-300">프로필 완성도를 100%로 채우면 매칭 확률이 올라갑니다!</p>
             </div>
          </StandardCard>
        </div>
      </div>
    </div>
  );
}

// 간단한 통계 카드 컴포넌트
function StatCard({ label, value, icon, color }: { label: string, value: number, icon: string, color: string }) {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
        yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colorClasses[color]}`}>
                    {icon}
                </div>
                {/* 상승세 표시 등 추가 가능 */}
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{label}</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{value}</h3>
        </div>
    )
}