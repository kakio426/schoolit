import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * SSO(Single Sign-On) 토큰을 처리하는 커스텀 훅
 * URL 파라미터에서 sso_token을 감지하고 백엔드 API를 통해 인증 처리
 * eduitit에서 전달받은 JWT 토큰을 검증하고 자동으로 대시보드로 이동
 */
export const useSSO = () => {
  const router = useRouter();

  useEffect(() => {
    const handleSSO = async () => {
      // 현재 URL에서 sso_token 파라미터 추출
      const urlParams = new URLSearchParams(window.location.search);
      const ssoToken = urlParams.get('sso_token');

      if (!ssoToken) {
        return; // SSO 토큰이 없으면 처리하지 않음
      }

      try {
        // 백엔드 SSO 엔드포인트 호출 (schoolit.shop 도메인)
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://backend-production-1598.up.railway.app';
        const response = await fetch(
          `${apiUrl}/auth/sso?sso_token=${encodeURIComponent(ssoToken)}`,
          {
            method: 'GET',
            credentials: 'include', // 쿠키 포함
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`SSO authentication failed: ${response.statusText}`);
        }

        const data = await response.json();
        const { accessToken, redirectUrl, role } = data;

        // JWT 토큰을 로컬 스토리지에 저장
        if (accessToken) {
          localStorage.setItem('authToken', accessToken);

          // 역할(role)에 따른 리다이렉트 처리
          const roleRedirectMap: Record<string, string> = {
            'SCHOOL': '/school/dashboard',
            'INSTRUCTOR': '/instructor/jobs',
            'COMPANY': '/company/events',
            'APPLICANT': '/applicant/dashboard',
            'ADMIN': '/admin/dashboard',
          };

          const finalRedirectPath = roleRedirectMap[role] || '/dashboard';
          
          // 토큰 파라미터를 제거하고 해당 페이지로 이동
          router.push(finalRedirectPath);
        } else {
          throw new Error('No access token received from SSO');
        }
      } catch (error) {
        console.error('[SSO] Error:', error);
        // SSO 실패 시 로그인 페이지로 리다이렉트
        router.push('/auth/login');
      }
    };

    handleSSO();
  }, [router]);
};
