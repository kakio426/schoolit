"use client";

import { SocialButton } from "@/components/ui/SocialButton";

export default function Home() {
  const handleLogin = (provider: 'kakao' | 'naver' | 'test-login') => {
    // 백엔드 API로 리다이렉트
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    console.log('Backend URL:', backendUrl);

    window.location.href = `${backendUrl}/api/auth/${provider}`;
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center space-y-8 animate-in fade-in zoom-in duration-500">
          {/* Brand Logo Area */}
          <div className="flex flex-col items-center space-y-4 mb-4">
            <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center shadow-inner mb-4">
              <span className="text-4xl">🎓</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              School It
            </h1>
            <p className="text-foreground-muted text-center max-w-xs">
              선생님과 학교를 잇는<br />가장 스마트한 방법
            </p>
          </div>

          {/* Login Buttons Area */}
          <div className="w-full space-y-3">
            <SocialButton
              provider="kakao"
              onClick={() => handleLogin('kakao')}
            />
            <SocialButton
              provider="naver"
              onClick={() => handleLogin('naver')}
            />

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-foreground/10"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-foreground-muted">Dev Only</span>
              </div>
            </div>

            <button
              onClick={() => handleLogin('test-login')}
              className="w-full h-12 rounded-xl border border-dashed border-primary/50 text-primary font-medium hover:bg-primary/5 transition-all"
            >
              테스트 계정으로 시작하기 (ID/Secret 불필요)
            </button>
          </div>

          {/* Footer */}
          <div className="mt-12 text-xs text-foreground-muted text-center">
            <p>계속 진행하면 이용약관 및</p>
            <p>개인정보 처리방침에 동의하게 됩니다.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
