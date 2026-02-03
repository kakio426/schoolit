'use client';

import { useSSO } from '@/hooks/useSSO';
import { useEffect, useState } from 'react';

/**
 * SSO 콜백 페이지 (schoolit.shop)
 * eduitit에서 sso_token과 함께 리다이렉트된 페이지
 * URL: https://schoolit.shop/auth/sso?sso_token=...
 * 
 * 처리 흐름:
 * 1. useSSO 훅이 URL에서 sso_token 추출
 * 2. 백엔드 /auth/sso 엔드포인트로 토큰 검증 요청
 * 3. 검증 성공 시 accessToken과 역할 정보 반환
 * 4. 역할(role)에 따라 자동으로 해당 대시보드로 리다이렉트
 *    - SCHOOL → /school/dashboard
 *    - INSTRUCTOR → /instructor/jobs
 *    - COMPANY → /company/events
 *    - APPLICANT → /applicant/dashboard
 */
export default function SSOCallbackPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // SSO 토큰 처리
  useSSO();

  useEffect(() => {
    // 로딩 상태 업데이트 (5초 후 타임아웃 에러 표시)
    const timer = setTimeout(() => {
      setIsLoading(false);
      setError('인증 처리 중에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        {isLoading ? (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              schoolit 인증 중...
            </h1>
            <p className="text-gray-600">
              eduitit에서 전달된 토큰을 검증하고 있습니다.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              역할에 맞는 대시보드로 자동 이동합니다.
            </p>
          </>
        ) : (
          <>
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              인증 실패
            </h1>
            <p className="text-gray-600 mb-6">
              {error}
            </p>
            <div className="space-x-4">
              <a
                href="/auth/login"
                className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                로그인 페이지로
              </a>
              <a
                href="/"
                className="inline-block px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                홈으로
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
