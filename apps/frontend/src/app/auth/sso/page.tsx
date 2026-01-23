'use client';

import { useSSO } from '@/hooks/useSSO';
import { useEffect, useState } from 'react';

/**
 * SSO 콜백 페이지
 * eduitit에서 sso_token과 함께 리다이렉트된 페이지
 * URL: schoolit.com/auth/sso?sso_token=...
 */
export default function SSOCallbackPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // SSO 토큰 처리
  useSSO();

  useEffect(() => {
    // 로딩 상태 업데이트 (3초 후 에러 표시)
    const timer = setTimeout(() => {
      setIsLoading(false);
      setError('인증 처리 중에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }, 3000);

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
              인증 처리 중입니다
            </h1>
            <p className="text-gray-600">
              잠시만 기다려주세요...
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
            <a
              href="/auth/login"
              className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              로그인 페이지로 이동
            </a>
          </>
        )}
      </div>
    </div>
  );
}
