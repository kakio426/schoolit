# Task: RAG Stabilization & CORS Fix

- [ ] **Phase 1: Backend Core Stabilization**
    - [ ] Test 1.1: Health Check & Swagger 접속 테스트 (RED) <!-- id: 1 -->
    - [ ] Task 1.2: 패키지 설치 (`cookie-parser`) <!-- id: 2 -->
    - [ ] Task 1.3: `main.ts` 전면 리팩토링 (Validation, Swagger, Logging CORS, Env Var) <!-- id: 3 -->
    - [ ] Task 1.4: 환경변수 기본값 정리 <!-- id: 4 -->
    - [ ] Quality Gate Phase 1 (Build, Test, Type Check) <!-- id: 5 -->

- [ ] **Phase 2: RAG Text Ingestion Flow**
    - [ ] Test 2.1: 텍스트 업로드 E2E 테스트 작성 (RED) <!-- id: 6 -->
    - [ ] Task 2.2: `RagController` 및 `RagService` 점검 (ValidationPipe) <!-- id: 7 -->
    - [ ] Task 2.3: 프론트엔드 `DocumentUpload` 재확인 <!-- id: 8 -->
    - [ ] Quality Gate Phase 2 (E2E Test Pass, Log Verification) <!-- id: 9 -->

- [ ] **Phase 3: Verification (Deployment)**
    - [ ] Task 3.1: Git Push & Railway Deploy <!-- id: 10 -->
    - [ ] Task 3.2: `schoolit.shop`에서 텍스트 학습 시나리오 수행 <!-- id: 11 -->
    - [ ] Task 3.3: Railway 로그 확인 <!-- id: 12 -->
