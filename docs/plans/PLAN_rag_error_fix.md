# Implementation Plan: RAG 500 Error Fix (Undefined Length)

**Status**: 🔄 In Progress
**Started**: 2026-01-18
**Last Updated**: 2026-01-18

---

## 📋 Overview
**목표**: `TypeError: Cannot read properties of undefined (reading 'length')` 500 에러 해결.
**원인**: `ChunkingService`에서 에러 발생 시 `undefined`를 반환하거나 예외가 전파될 때, `RagService`가 이를 감지하지 못하고 `chunks.length`에 접근하여 크래시 발생.

## 🏗️ Changes

### 1. `apps/backend/src/rag/chunking.service.ts`
- **Objective**: 침묵하는 에러(`undefined`) 방지.
- **Action**:
    - `splitByPages` 메서드 전체를 `try-catch`로 감쌉니다.
    - 에러 발생 시 로그(`logger.error`)를 남기고, **빈 배열(`[]`)을 반환**하여 호출자가 죽지 않도록 보장합니다.
    - 내부의 `splitTextIntoChunks` 메서드도 안전하게 처리합니다.

### 2. `apps/backend/src/rag/rag.service.ts`
- **Objective**: 빈 결과(`[]`) 또는 `undefined`에 대한 방어 로직 추가.
- **Action**:
    - `ingestDocument` 메서드에서 `chunks` 변수 확인.
    - `if (!chunks || chunks.length === 0)` 조건일 경우:
        - 경고 로그 출력.
        - `InternalServerErrorException` 발생 (사용자에게 명확한 실패 원인 전달).

## 🧪 Verification Plan
- **Verification**:
    - Deploy to Railway.
    - Upload the problematic long text again.
    - **Expected**:
        - Success (if chunking works).
        - OR "Text processing failed" 500 Error (handled graceful error) with detailed server logs explaining WHY it failed (e.g., regex error, memory limit), instead of a random crash.

