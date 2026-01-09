# Implementation Plan: 2025 경기도교육청 지침 준수 플랫폼 (Schoolit Compliance Engine)

**Status**: ✅ Completed
**Started**: 2026-01-09
**Last Updated**: 2026-01-09
**Completed**: 2026-01-09

---

## 📋 Overview

### Feature Description
경기도교육청의 '2025 계약제교원 운영 지침'을 완벽하게 준수하는 **"컴플라이언스 엔진(Compliance Engine)"**과 **"프리미엄 문서 생성(Premium Document Engine)"** 기능을 구축합니다.
단순한 채용 게시판을 넘어, **[채용 계획] → [공고] → [심사] → [계약] → [행정 서류 파기]**에 이르는 전 과정을 시스템으로 강제하여 학교의 행정 리스크를 원천 차단합니다.

### Success Criteria
- [x] **100% 서식 일치**: [서식 1] 채용계획서, [서식 16] 표준근로계약서, [서식 12~14] 평가표가 실제 공문과 동일한 규격(PDF)으로 생성되어야 함.
- [x] **개인정보 자동 파기**: 탈락자의 민감 정보(증빙 파일 등)가 채용 확정 후 7일 이내에, 혹은 '반환 청구' 시 즉시 물리적으로 파기되어야 함.
- [x] **호봉/기간 자동 검증**: 시스템이 '교육공무원법' 및 '지침'에 따라 최대 호봉(14호봉 제한 등)과 계약 기간을 자동 검증해야 함.
- [x] **TDD 준수**: 비즈니스 로직(호봉 계산, 파기 기한 계산) 핵심 로직 구현 완료.

---

## 🚀 Implementation Phases

### Phase 1: Premium Document Engine Foundation ✅ COMPLETED
- [x] Install `@react-pdf/renderer` & Configure Fonts
- [x] Create `DocumentService` (Common Header/Footer/Watermark)
- [x] Implement `Seosik1_HiringPlan.tsx` Template
- [x] Extract common document styles to `documentStyles.ts`

### Phase 2: Compliance Workflow & Wizard UI ✅ COMPLETED
- [x] Update `schema.prisma` (Workflow states, Hiring reasons)
- [x] Implement `HiringWizard` Frontend Component (3-step flow)
- [x] Create compliance constants (`compliance.ts`)
- [x] Implement backend `ComplianceService` validation logic

### Phase 3: Digital Evaluation & Ranking ✅ COMPLETED
- [x] Create `Evaluation` & `Score` models
- [x] Implement `DigitalScorecard.tsx` with merit bonus logic
- [x] Create Evaluation Page (`/dashboard/jobs/[id]/evaluate`)
- [x] Implement score aggregation and ranking in backend

### Phase 4: Lifecycle Management ✅ COMPLETED
- [x] Implement `Seosik16_Contract.tsx` (Standard Labor Contract)
- [x] Implement `DataCleanupService` (7-day auto cleanup cron)
- [x] Implement `immediateDocumentDestruction` API for PIPA compliance
- [x] Verify full build and integration status
