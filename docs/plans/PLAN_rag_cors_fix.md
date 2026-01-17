# Implementation Plan: RAG CORS 문제 최종 해결

**Status**: 🔄 In Progress
**Started**: 2026-01-17
**Last Updated**: 2026-01-17
**Estimated Completion**: 2026-01-17

---

**⚠️ CRITICAL INSTRUCTIONS**: After completing each phase:
1. ✅ Check off completed task checkboxes
2. 🧪 Run all quality gate validation commands
3. ⚠️ Verify ALL quality gate items pass
4. 📅 Update "Last Updated" date above
5. 📝 Document learnings in Notes section
6. ➡️ Only then proceed to next phase

⛔ **DO NOT skip quality gates or proceed with failing checks**

---

## 📋 Overview

### Feature Description
NestJS 백엔드에서 발생하는 CORS 에러를 해결합니다. 
`AuthGuard`가 인증 실패 시 던지는 401 에러 응답에 CORS 헤더가 누락되어, 브라우저에서 "CORS 에러"로 표시되는 문제입니다.

### Success Criteria
- [ ] `schoolit.shop`에서 `/api/rag/upload` 호출 시 CORS 에러 없음
- [ ] `schoolit.shop`에서 `/api/rag/stats` 호출 시 CORS 에러 없음
- [ ] Network 탭에서 `Access-Control-Allow-Origin` 헤더 확인 가능
- [ ] 텍스트 붙여넣기 후 녹색 체크 표시 (또는 명확한 인증 오류 메시지)

### User Impact
관리자가 RAG 시스템에 문서를 업로드하고 AI에게 질문할 수 있게 됩니다.

---

## 🏗️ Architecture Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| Express `cors` 미들웨어 직접 사용 | NestJS `enableCors()`보다 파이프라인 앞에서 실행됨 | NestJS 표준 방식이 아님 |
| `origin: '*'` 와일드카드 | 개발 환경에서 모든 출처 허용으로 문제 격리 용이 | 프로덕션에서 보안 강화 필요 |

---

## 📦 Dependencies

### Required Before Starting
- [x] Railway 백엔드 서버 정상 작동 (v1.3.1 확인됨)
- [x] 프론트엔드 API 주소 백엔드로 고정 완료

### External Dependencies
- cors: ^2.8.5 (이미 설치됨)

---

## 🧪 Test Strategy

### Testing Approach
**TDD Principle**: Write tests FIRST, then implement to make them pass

### Test Pyramid for This Feature
| Test Type | Coverage Target | Purpose |
|-----------|-----------------|---------|
| **Unit Tests** | N/A | CORS는 미들웨어 레벨로 E2E 검증 필요 |
| **Integration Tests** | 핵심 경로 | 실제 HTTP 요청/응답 검증 |
| **E2E Tests** | 1개 핵심 플로우 | 브라우저에서 CORS 헤더 확인 |

### Test File Organization
```
apps/backend/test/
└── e2e/
    └── cors.e2e-spec.ts
```

---

## 🚀 Implementation Phases

### Phase 1: Express CORS 미들웨어 적용
**Goal**: 모든 응답(에러 포함)에 CORS 헤더 주입
**Estimated Time**: 30분
**Status**: ⏳ Pending

#### Tasks

**🔴 RED: Write Failing Tests First**
- [ ] **Test 1.1**: CORS 헤더 검증 E2E 테스트 작성
  - File(s): `apps/backend/test/e2e/cors.e2e-spec.ts`
  - Expected: Tests FAIL (현재 CORS 헤더 누락)
  - Details: 
    - OPTIONS preflight 요청 시 `Access-Control-Allow-Origin` 헤더 존재 확인
    - 401 에러 응답 시에도 CORS 헤더 존재 확인

**🟢 GREEN: Implement to Make Tests Pass**
- [ ] **Task 1.2**: `main.ts`에 Express cors 미들웨어 추가
  - File(s): `apps/backend/src/main.ts`
  - Goal: Test 1.1 패스
  - Details:
    - `import * as cors from 'cors';`
    - `app.use(cors({ origin: '*', credentials: false }));` 를 `enableCors()` 대신 사용
    - NestJS 파이프라인보다 먼저 실행되도록 위치 조정

- [ ] **Task 1.3**: 버전을 v1.4.0으로 업데이트
  - File(s): `apps/backend/src/main.ts`
  - Goal: 배포 확인용

**🔵 REFACTOR: Clean Up Code**
- [ ] **Task 1.4**: 코드 정리
  - Files: `main.ts`
  - Goal: 불필요한 설정 제거, 주석 정리
  - Checklist:
    - [ ] Remove duplication (DRY principle)
    - [ ] Improve naming clarity
    - [ ] Add inline documentation

#### Quality Gate ✋

**⚠️ STOP: Do NOT proceed to Phase 2 until ALL checks pass**

**TDD Compliance** (CRITICAL):
- [ ] **Red Phase**: Tests were written FIRST and initially failed
- [ ] **Green Phase**: Production code written to make tests pass
- [ ] **Refactor Phase**: Code improved while tests still pass
- [ ] **Coverage Check**: Test coverage meets requirements

**Build & Tests**:
- [ ] **Build**: `npm run build` 성공
- [ ] **All Tests Pass**: 100% of tests passing
- [ ] **Test Performance**: Test suite completes in acceptable time
- [ ] **No Flaky Tests**: Tests pass consistently

**Validation Commands**:
```bash
# Backend Build
cd apps/backend && npm run build

# E2E Test
npm run test:e2e -- cors

# Git Push
git add . && git commit -m "fix: apply Express cors middleware for proper CORS headers" && git push
```

**Manual Test Checklist**:
- [ ] Railway 배포 완료 후 v1.4.0 확인
- [ ] 브라우저 콘솔에서 CORS 에러 메시지 사라짐
- [ ] Network 탭에서 `Access-Control-Allow-Origin: *` 헤더 존재

---

### Phase 2: 브라우저 실제 검증
**Goal**: 프로덕션 환경에서 CORS 문제 완전 해결 확인
**Estimated Time**: 15분
**Status**: ⏳ Pending

#### Tasks

**🟢 GREEN: Verification**
- [ ] **Task 2.1**: Railway 배포 완료 확인
  - `https://backend-production-1598.up.railway.app/api/health` 접속
  - `version: "1.4.0"` 확인

- [ ] **Task 2.2**: 브라우저에서 실제 테스트
  - `schoolit.shop` 접속
  - 로그인 후 AI 어시스턴트 페이지 이동
  - 텍스트 붙여넣기 → 학습시키기 클릭
  - 콘솔에서 CORS 에러 없이 401(인증 필요) 또는 200(성공) 확인

#### Quality Gate ✋

**Manual Test Checklist**:
- [ ] CORS 에러 메시지 완전 사라짐
- [ ] 401 Unauthorized 또는 200 OK 상태 코드 확인
- [ ] 텍스트 업로드 시 녹색 체크 또는 명확한 에러 메시지

---

## ⚠️ Risk Assessment

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| Express cors와 NestJS 간 충돌 | Low | Medium | enableCors() 제거하고 Express cors만 사용 |
| Railway 프록시가 헤더 제거 | Medium | High | Railway 지원팀 문의 또는 Vercel rewrites 사용 |
| 인증 토큰 누락으로 인한 401 지속 | Medium | Medium | 프론트엔드 토큰 전달 로직 점검 |

---

## 🔄 Rollback Strategy

### If Phase 1 Fails
**Steps to revert**:
- `main.ts`에서 `app.use(cors(...))` 제거
- `app.enableCors()` 복원
- `git revert HEAD` 실행

### 대안 전략 (Express cors도 실패 시)
1. **RagController에서 @UseGuards 제거**: 인증 없이 RAG 접근 허용 (임시)
2. **Vercel rewrites 설정**: 프론트엔드에서 `/api/*` 요청을 백엔드로 프록시

---

## 📊 Progress Tracking

### Completion Status
- **Phase 1**: ⏳ 0%
- **Phase 2**: ⏳ 0%

**Overall Progress**: 0% complete

---

## 📝 Notes & Learnings

### Implementation Notes
- 6시간 동안 NestJS enableCors()로 해결 시도했으나 실패
- 핵심 발견: AuthGuard 예외 발생 시 CORS 헤더 누락됨
- Express 레벨 미들웨어가 NestJS 파이프라인보다 먼저 실행되어 해결 가능

### Blockers Encountered
- **Blocker 1**: Railway 프록시가 CORS 헤더를 처리하는 방식 불명확 → Express 레벨에서 직접 처리로 해결 시도

---

**Plan Status**: 🔄 In Progress
**Next Action**: Phase 1 - Express CORS 미들웨어 적용
**Blocked By**: None
