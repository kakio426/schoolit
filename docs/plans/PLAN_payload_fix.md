# Implementation Plan: RAG Payload & Validation Fix

**Status**: 🔄 In Progress
**Started**: 2026-01-17
**Last Updated**: 2026-01-17

---

## 📋 Overview
 해결 목표: 긴 텍스트(5초 이상 소요 또는 즉시 차단되는) 업로드 시 발생하는 `400 Bad Request` 또는 `PayloadTooLarge` 오류를 해결합니다.
 솔루션: `main.ts`의 미들웨어 순서를 재조정(CORS 우선, 용량 제한 50MB)하고, DTO의 유효성 검사를 완화합니다.

## 🏗️ Changes

### 1. `apps/backend/src/main.ts`
- **Critical Reordering**:
    1. `NestFactory.create(AppModule, { cors: false })` (Disable default CORS)
    2. `app.enableCors(...)` (Manual Configuration FIRST)
    3. `app.use(json({ limit: '50mb' }))` (Body Parser SECOND)
    4. `app.use(urlencoded({ limit: '50mb' }))`
    5. `app.use(cookieParser())`
    6. `ValidationPipe` (`forbidNonWhitelisted` commented out/removed)

### 2. `apps/backend/src/rag/dto/ingest-text.dto.ts`
- **Relax Validation**:
    - Remove `@IsNotEmpty`, `@IsString` strict checks or ensure they don't block large inputs.
    - (User instruction: "제한을 확 풀어버립니다") -> Remove decorators or simplify.

## 🧪 Verification Plan
- **Manual Verification**:
    - Deploy to Railway.
    - Upload a long text (e.g., K-Education standard text) on `schoolit.shop`.
    - Confirm "Ingestion Complete" toaster and no CORS/400 errors in Console/Network tab.

