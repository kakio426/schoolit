import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * SSO(Single Sign-On) 토큰을 처리하는 커스텀 훅
 * URL 파라미터에서 sso_token을 감지하고 백엔드 API를 통해 인증 처리
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
        // 백엔드 SSO 엔드포인트 호출
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/sso?sso_token=${encodeURIComponent(ssoToken)}`,
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
        const { accessToken } = data;

        // JWT 토큰을 로컬 스토리지에 저장
        if (accessToken) {
          localStorage.setItem('authToken', accessToken);

          // 사용자 정보 조회 후 해당 역할에 맞는 페이지로 리다이렉트
          const profileResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/profile`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (profileResponse.ok) {
            const userProfile = await profileResponse.json();
            const role = userProfile.role;

            // 역할에 따라 리다이렉트
            const redirectPaths: Record<string, string> = {
              SCHOOL: '/school/dashboard',
              INSTRUCTOR: '/instructor/jobs',
              COMPANY: '/company/events',
              APPLICANT: '/applicant/dashboard',
              ADMIN: '/admin/dashboard',
            };

            const redirectPath = redirectPaths[role] || '/dashboard';
            router.push(redirectPath);
          } else {
            // 프로필 조회 실패 시 기본 대시보드로
            router.push('/dashboard');
          }
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
