# Schoolit SSO 구현 완료 보고서

## 📋 구현 개요
`SSO_GUIDE_FOR_SCHOOLIT.md` 가이드를 바탕으로 schoolit 프로젝트에 eduitit SSO(Single Sign-On) 통합을 완료했습니다.

---

## ✅ 완료된 작업

### 1. **환경 변수 설정**
**파일:** [apps/backend/.env](apps/backend/.env)

SSO_JWT_SECRET을 환경 변수에 추가했습니다:
```dotenv
# SSO Configuration (eduitit)
SSO_JWT_SECRET="에듀이티잇의 settings.py에 설정된 것과 동일한 시크릿 키"
```

**주의:** 실제 운영 환경에서는 `에듀이티잇의 settings.py에 설정된 것과 동일한 시크릿 키`로 교체해야 합니다.

---

### 2. **백엔드 SSO Guard 구현**
**파일:** [apps/backend/src/auth/guards/sso.guard.ts](apps/backend/src/auth/guards/sso.guard.ts)

SSOGuard를 구현했습니다:
- URL 쿼리 파라미터에서 `sso_token` 감지
- JWT 토큰 검증 (SSO_JWT_SECRET 사용)
- 검증된 페이로드를 `request.user`에 저장
- 토큰이 없거나 검증 실패 시 적절한 처리

```typescript
@Injectable()
export class SSOGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.query.sso_token;

    if (!token) return true; // SSO 토큰이 없으면 일반 인증 흐름으로
    
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('SSO_JWT_SECRET'),
      });
      request['user'] = payload; 
      return true;
    } catch {
      throw new UnauthorizedException('Invalid SSO Token');
    }
  }
}
```

---

### 3. **백엔드 인증 모듈 업데이트**
**파일:** [apps/backend/src/auth/auth.module.ts](apps/backend/src/auth/auth.module.ts)

- SSOGuard import 추가
- ConfigModule import 추가 (환경 변수 접근용)
- SSOGuard를 providers에 등록
- SSOGuard를 exports에 등록

---

### 4. **백엔드 컨트롤러에 SSO 엔드포인트 추가**
**파일:** [apps/backend/src/auth/auth.controller.ts](apps/backend/src/auth/auth.controller.ts)

SSO 콜백 엔드포인트를 구현했습니다:
```typescript
@Get('sso')
@UseGuards(SSOGuard)
async ssoCallback(@Request() req) {
  if (!req.user) {
    throw new BadRequestException('Invalid SSO token');
  }

  // SSO 토큰의 사용자 정보를 기반으로 유저 찾기 또는 생성
  const user = await this.authService.findOrCreateSSOUser(req.user);
  return this.authService.login(user);
}
```

---

### 5. **백엔드 인증 서비스에 SSO 사용자 처리 메서드 추가**
**파일:** [apps/backend/src/auth/auth.service.ts](apps/backend/src/auth/auth.service.ts)

`findOrCreateSSOUser` 메서드를 구현했습니다:
```typescript
async findOrCreateSSOUser(ssoPayload: any) {
  const { username, email, sub, role, name } = ssoPayload;

  // 기존 사용자 찾기
  let user = await this.userService.findOne(email || username);

  if (!user) {
    // 새 사용자 생성
    user = await this.userService.create({
      email: email || username,
      name: name || username,
      role: role || 'APPLICANT', // 기본값
      password: '', // SSO 사용자는 비밀번호 없음
    });
  }

  return user;
}
```

---

### 6. **프론트엔드 SSO 커스텀 훅 구현**
**파일:** [apps/frontend/src/hooks/useSSO.ts](apps/frontend/src/hooks/useSSO.ts)

SSO 토큰 처리용 React 커스텀 훅을 구현했습니다:
- URL 파라미터에서 `sso_token` 감지
- 백엔드 `/auth/sso` 엔드포인트 호출
- JWT 토큰 저장
- 사용자 역할에 따라 자동 리다이렉트

```typescript
export const useSSO = () => {
  const router = useRouter();

  useEffect(() => {
    const handleSSO = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const ssoToken = urlParams.get('sso_token');

      if (!ssoToken) return;

      try {
        const response = await fetch(
          `/api/auth/sso?sso_token=${encodeURIComponent(ssoToken)}`,
          { method: 'GET', credentials: 'include' }
        );

        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        
        // 역할에 따라 리다이렉트
        const redirectPaths = {
          SCHOOL: '/school/dashboard',
          INSTRUCTOR: '/instructor/jobs',
          COMPANY: '/company/events',
          // ...
        };
        router.push(redirectPaths[role] || '/dashboard');
      } catch (error) {
        console.error('[SSO] Error:', error);
        router.push('/auth/login');
      }
    };

    handleSSO();
  }, [router]);
};
```

---

### 7. **프론트엔드 SSO 콜백 페이지 생성**
**파일:** [apps/frontend/src/app/auth/sso/page.tsx](apps/frontend/src/app/auth/sso/page.tsx)

SSO 콜백을 처리할 페이지를 생성했습니다:
- URL: `schoolit.com/auth/sso?sso_token=...`
- `useSSO` 훅을 사용하여 토큰 처리
- 처리 중 로딩 UI 표시
- 처리 실패 시 로그인 페이지로 리다이렉트

---

## 🔄 SSO 흐름도

```
eduitit (Python Django)
    │
    ├─ 사용자 로그인
    ├─ JWT 토큰 생성 (SSO_JWT_SECRET으로 서명)
    └─ schoolit로 리다이렉트: https://schoolit.com/auth/sso?sso_token=...
         │
         ▼
    Schoolit Frontend (Next.js)
    ├─ /auth/sso 페이지 로드
    ├─ useSSO 훅 실행
    └─ URL에서 sso_token 추출
         │
         ▼
    Backend API Call
    ├─ GET /auth/sso?sso_token=...
    ├─ SSOGuard가 토큰 검증
    ├─ JWT 검증 (ConfigService에서 SSO_JWT_SECRET 사용)
    └─ 검증 성공 → request.user 설정
         │
         ▼
    AuthService.findOrCreateSSOUser()
    ├─ 사용자 정보로 유저 조회
    ├─ 없으면 새 유저 생성
    └─ authService.login() → JWT 토큰 반환
         │
         ▼
    Frontend
    ├─ 액세스 토큰 저장 (localStorage)
    ├─ 사용자 프로필 조회
    ├─ 역할(role)에 따라 페이지 결정
    └─ 해당 대시보드로 자동 리다이렉트
         │
         ▼
    Logged In Dashboard
    ├─ SCHOOL → /school/dashboard
    ├─ INSTRUCTOR → /instructor/jobs
    ├─ COMPANY → /company/events
    └─ APPLICANT → /applicant/dashboard
```

---

## 🔧 필요한 추가 설정

### Backend .env 파일 업데이트
```dotenv
SSO_JWT_SECRET="에듀이티잇의 settings.py에서 생성한 실제 시크릿 키"
```

### Frontend 환경 변수 확인
`apps/frontend/.env.local` 또는 `apps/frontend/.env` 파일에 다음이 설정되어 있는지 확인하세요:
```
NEXT_PUBLIC_API_URL=https://backend-production-1598.up.railway.app
```

---

## 📝 사용 방법

### eduitit에서 schoolit으로 SSO 로그인
1. eduitit 사용자가 로그인
2. eduitit이 JWT 토큰 생성 (SSO_JWT_SECRET으로 서명)
3. 사용자를 schoolit으로 리다이렉트:
   ```
   https://schoolit.com/auth/sso?sso_token=<JWT_TOKEN>
   ```
4. Schoolit이 토큰 검증 후 자동으로 해당 대시보드로 이동

### 테스트 방법
```bash
# 테스트용 JWT 토큰 생성 (Python)
import jwt
import json
from datetime import datetime

SECRET = "에듀이티잇의 settings.py에 설정된 시크릿 키"
payload = {
    "username": "test@example.com",
    "email": "test@example.com",
    "name": "Test User",
    "role": "INSTRUCTOR",
    "sub": "123456"
}

token = jwt.encode(payload, SECRET, algorithm="HS256")
print(token)

# 생성된 토큰으로 테스트
# https://schoolit.com/auth/sso?sso_token=<생성된_토큰>
```

---

## 📦 구현된 파일 목록

| 파일 경로 | 설명 |
|---------|------|
| [apps/backend/.env](apps/backend/.env) | SSO_JWT_SECRET 환경 변수 추가 |
| [apps/backend/src/auth/guards/sso.guard.ts](apps/backend/src/auth/guards/sso.guard.ts) | SSO Guard 구현 |
| [apps/backend/src/auth/auth.module.ts](apps/backend/src/auth/auth.module.ts) | SSOGuard 등록 및 ConfigModule 임포트 |
| [apps/backend/src/auth/auth.controller.ts](apps/backend/src/auth/auth.controller.ts) | SSO 콜백 엔드포인트 추가 |
| [apps/backend/src/auth/auth.service.ts](apps/backend/src/auth/auth.service.ts) | findOrCreateSSOUser() 메서드 추가 |
| [apps/frontend/src/hooks/useSSO.ts](apps/frontend/src/hooks/useSSO.ts) | SSO 토큰 처리 커스텀 훅 |
| [apps/frontend/src/app/auth/sso/page.tsx](apps/frontend/src/app/auth/sso/page.tsx) | SSO 콜백 페이지 |

---

## ✨ 핵심 기능

✅ **JWT 토큰 검증**: eduitit에서 생성한 JWT 토큰을 SSO_JWT_SECRET으로 검증  
✅ **자동 사용자 생성**: SSO 토큰에 포함된 정보로 새 사용자 자동 생성  
✅ **역할 기반 리다이렉트**: 사용자의 역할(role)에 따라 자동으로 해당 대시보드로 이동  
✅ **토큰 관리**: 로컬 스토리지에 액세스 토큰 저장 및 API 요청 시 사용  
✅ **에러 처리**: SSO 실패 시 로그인 페이지로 자동 리다이렉트  

---

## 🚀 다음 단계

1. **eduitit 설정**: eduitit의 `settings.py`에서 SSO_JWT_SECRET 값 확인
2. **환경 변수 설정**: schoolit의 `.env` 파일에 실제 SSO_JWT_SECRET 값 입력
3. **테스트**: JWT 토큰 생성 후 `/auth/sso?sso_token=...` URL로 테스트
4. **프로덕션 배포**: 모든 환경 변수가 올바르게 설정된 후 배포

---

**구현 완료 날짜**: 2026년 1월 23일
