# Implementation Plan: RAG Stabilization & CORS Fix

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
RAG 시스템의 안정성을 확보하고 지속적인 CORS 문제를 근본적으로 해결합니다.
사용자가 제공한 가이드에 따라 백엔드 설정을 강화(Swagger, ValidationPipe, 정교한 CORS 로깅)하고, RAG 텍스트 업로드 기능을 완성합니다. 특히 Railway 환경 변수(`FRONTEND_URL`)와 연동하여 보안성과 안정성을 동시에 잡습니다.

### Success Criteria
- [ ] 백엔드 `main.ts`가 검증된 구조(Swagger, Validation, Logging CORS)로 업데이트됨
- [ ] 프론트엔드 `api.ts` 및 요청 로직이 안정적으로 백엔드와 통신
- [ ] RAG 텍스트 업로드(`ingestDocument`)가 CORS 에러 없이 성공
- [ ] Next.js Proxy와 백엔드 CORS 설정이 조화롭게 동작

### User Impact
사용자는 더 이상 학습 중 멈춤이나 오류를 경험하지 않으며, 개발자는 명확한 로그를 통해 문제를 추적할 수 있습니다.

---

## 🏗️ Architecture Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| **Next.js Rewrite 유지 + 백엔드 CORS 강화** | Rewrite는 100% 보장되는 우회로이며, 백엔드 CORS는 직접 접근을 위한 2차 방어선임 | 설정이 두 곳으로 분산되지만 안정성 극대화 |
| **EnableCors with Dynamic Origin** | 개발/배포 환경에 따라 유동적으로 허용하며, 차단 시 명확한 로그 남김 | 설정 코드가 다소 복잡해짐 |
| **ValidationPipe Global Scope** | 모든 DTO 요청에 대해 자동 검증 수행 | 잘못된 요청은 400 에러로 즉시 거부 |

---

## 📦 Dependencies

### Required Before Starting
- [x] `cookie-parser` 패키지 설치 필요
- [ ] Railway Env Var: `FRONTEND_URL` 설정 필요 (사용자 수행 또는 기본값 처리)

### External Dependencies
- `cookie-parser`: ^1.4.6
- `@nestjs/swagger`: (이미 설치됨)

---

## 🧪 Test Strategy

### Testing Approach
**TDD Principle**: Write tests FIRST, then implement to make them pass.

### Test Pyramid for This Feature
| Test Type | Coverage Target | Purpose |
|-----------|-----------------|---------|
| **Integration (E2E)** | RAG Upload Flow | 실제 HTTP 요청을 통한 CORS 및 기능 검증 |

### Test File Organization
```
apps/backend/test/e2e/rag-upload.e2e-spec.ts
```

---

## 🚀 Implementation Phases

### Phase 1: Backend Core Stabilization
**Goal**: `main.ts`를 검증된 코드베이스로 교체하여 기본기(보안, 로그, 문서화) 강화
**Estimated Time**: 20분
**Status**: ⏳ Pending

#### Tasks

**🔴 RED: Write Failing Tests First**
- [ ] **Test 1.1**: Health Check & Swagger 접속 테스트
  - File: `apps/backend/test/e2e/health.e2e-spec.ts`
  - Expected: Swagger Endpoint 접근 시 200 OK (현재 설정 없음/미흡)

**🟢 GREEN: Implement to Make Tests Pass**
- [ ] **Task 1.2**: 패키지 설치
  - Command: `npm install cookie-parser && npm install -D @types/cookie-parser`

- [ ] **Task 1.3**: `main.ts` 전면 리팩토링 (사용자 제공 코드 적용)
  - ValidationPipe, Swagger, CookieParser 적용
  - CORS 로직: `allowedOrigins` 배열 및 로깅 콜백 구현
  - `FRONTEND_URL` 환경변수 처리 로직 추가

**🔵 REFACTOR: Clean Up Code**
- [ ] **Task 1.4**: 환경변수 기본값 정리
  - `FRONTEND_URL`이 없을 경우의 안전한 Fallback 설정

#### Quality Gate ✋
- [ ] `npm run build` 성공
- [ ] E2E 테스트 통과
- [ ] `cookie-parser` 타입 에러 없음

---

### Phase 2: RAG Text Ingestion Flow
**Goal**: 텍스트 업로드 기능의 완전한 동작 보장
**Estimated Time**: 30분
**Status**: ⏳ Pending

#### Tasks

**🔴 RED: Write Failing Tests First**
- [ ] **Test 2.1**: 텍스트 업로드 E2E 테스트 작성
  - File: `apps/backend/test/e2e/rag-upload.e2e-spec.ts`
  - Scenario: 유효한 텍스트 전송 시 201 Created 및 `chunksCreated` 반환

**🟢 GREEN: Implement to Make Tests Pass**
- [ ] **Task 2.2**: `RagController` 및 `RagService` 점검
  - `IngestTextDto` 유효성 검사 확인 (ValidationPipe 동작)
  - `doc.content` 길이 제한 등 예외 처리

- [ ] **Task 2.3**: 프론트엔드 `DocumentUpload` 재확인
  - `api.ts`를 통한 요청 전송 확인 (`withCredentials` 등 가이드 준수)

#### Quality Gate ✋
- [ ] `rag-upload.e2e-spec.ts` 통과
- [ ] 텍스트 업로드 시 백엔드 로그에 "Ingest Complete" 확인

---

### Phase 3: Verification (Deployment)
**Goal**: 배포 및 실제 환경 검증
**Estimated Time**: 10분
**Status**: ⏳ Pending

#### Tasks
- [ ] **Task 3.1**: Git Push & Railway Deploy
- [ ] **Task 3.2**: `schoolit.shop`에서 텍스트 학습 시나리오 수행
- [ ] **Task 3.3**: Railway 로그에서 CORS 차단/허용 로그 확인

#### Quality Gate ✋
- [ ] Browser Console: No CORS Errors
- [ ] Backend Logs: No "Blocked CORS origin" errors for legitimate traffic

---

## ⚠️ Risk Assessment

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| `FRONTEND_URL` 미설정 | High | Medium | `allowedOrigins`에 로컬 및 기본 배포 도메인 포함 |
| Swagger 충돌 | Low | Low | 경로 `/api/docs` 명확히 지정 |

---

## 🔄 Rollback Strategy
### If Phase 1 Fails
- `git revert`로 `main.ts` 원복
- `npm uninstall cookie-parser`

---

## 📊 Progress Tracking
- **Phase 1**: ⏳ 0%
- **Phase 2**: ⏳ 0%
- **Phase 3**: ⏳ 0%
