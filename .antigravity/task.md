# Task: RAG Payload & Error Fix

- [x] **Phase 1: Backend Core Stabilization** <!-- id: 1 -->
- [x] **Phase 2: RAG Text Ingestion Flow** <!-- id: 6 -->
- [x] **Phase 3: Payload Fix (5s Limit)** <!-- id: 13 -->
    - [x] Task 3.1: `apps/backend/src/main.ts` Middleware Order Re-configuration <!-- id: 13 -->
    - [x] Task 3.2: `apps/backend/src/rag/dto/ingest-text.dto.ts` Relax Validation <!-- id: 14 -->
    - [x] Task 3.3: Git Push & Railway Deploy (v1.7.0) <!-- id: 15 -->

- [ ] **Phase 4: 500 Error Fix (Undefined Length)**
    - [ ] Task 4.1: `ChunkingService` Safe Return (`try-catch` -> `[]`) <!-- id: 17 -->
    - [ ] Task 4.2: `RagService` Null Check (`!chunks` -> Exception) <!-- id: 18 -->
    - [ ] Task 4.3: Git Push & Railway Deploy (v1.7.1) <!-- id: 19 -->
    - [ ] Task 4.4: Verify Long Text Upload <!-- id: 20 -->
