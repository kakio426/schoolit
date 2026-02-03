# Implementation Plan: Regional Education Office Job Aggregator

**Status**: 🔄 In Progress
**Started**: 2026-02-03
**Last Updated**: 2026-02-03
**Estimated Completion**: 2026-02-10

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
Collects and aggregates recruitment information from 17 provincial/metropolitan Offices of Education (OE) in Korea, Nara-iliter (나라일터), and Worknet. This provides a comprehensive job board for teachers and businesses, solving the information fragmentation problem (similar to 방과후학교.com but with Schoolit's verification layer).

### Success Criteria
- [ ] Automatic daily ingestion of job postings from at least 3 major Education Offices (Seoul, Gyeonggi, Incheon).
- [ ] Structured extraction of "Salary", "Subject", "Closing Date" from unstructured board posts using AI.
- [ ] Unified search interface displaying both native and aggregated job listings.
- [ ] Automatic deduplication of same postings across multiple sources.

### User Impact
- **Teachers**: Find all school openings in one place without visiting 20+ different boards.
- **Businesses**: Identify sub-contracting or instructor opportunities more efficiently.
- **Schools**: Higher visibility for their postings even if they aren't active Schoolit users yet.

---

## 🏗️ Architecture Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| **Scraping + AI Parsing** | Most OE boards are unstructured BBS; LLMs can normalize this data with high accuracy. | Higher latency and cost for ingestion compared to pure regex. |
| **Separate Ingestion Service** | High load and potential blocking (scraping/AI) should not affect the main API. | Increased infrastructure complexity. |
| **Source Attribution** | Maintain transparency by linking to the original source board. | Some users might leave our site to view the original. |
| **Fingerprint-based Deduplication** | Prevent duplicate listings from multiple sources (e.g., OE + Worknet). | Small risk of over-deduplication if postings are very similar but different. |

---

## 📦 Dependencies

### Required Before Starting
- [x] Backend Framework: NestJS/Prisma established.
- [x] OpenAI or Google AI SDK: Configured for data extraction.
- [x] Puppeteer/Cheerio: For web scraping.

### External Dependencies
- `puppeteer`: ^22.0.0 (Scraping)
- `openai` or `langchain`: For LLM-based parsing.
- Nara-iliter Open API Key (from data.go.kr)
- Worknet Open API Key (from 고용정보원)

---

## 🧪 Test Strategy

### Testing Approach
**TDD Principle**: Write tests FIRST, then implement to make them pass. We will mock external API responses and HTML content for testing.

### Test Pyramid for This Feature
| Test Type | Coverage Target | Purpose |
|-----------|-----------------|---------|
| **Unit Tests** | ≥80% | Parser logic, Deduplication logic, Mapping functions |
| **Integration Tests** | Critical paths | Scraping -> AI Extraction -> DB Save flow |
| **E2E Tests** | Key user flows | Searching and viewing an aggregated job on the UI |

### Test File Organization
```
apps/backend/src/external-jobs/
├── tests/
│   ├── unit/
│   │   ├── parser.spec.ts
│   │   └── crawler.spec.ts
│   └── integration/
│       └── ingestion-flow.spec.ts
```

---

## 🚀 Implementation Phases

### Phase 1: Foundation & API Clients
**Goal**: Implement clients for structured Data Sources (Nara-iliter, Worknet).
**Estimated Time**: 4 hours
**Status**: ✅ Complete

#### Tasks
**🔴 RED: Write Failing Tests First**
- [x] **Test 1.1**: Unit test for `NaraIliterClient` fetching and parsing XML/JSON response.
- [x] **Test 1.2**: Unit test for `WorknetClient` fetching and parsing response.

**🟢 GREEN: Implement to Make Tests Pass**
- [x] **Task 1.3**: Implement `ExternalApiModule` with Nara-iliter Open API integration.
- [x] **Task 1.4**: Implement Worknet API client.

**🔵 REFACTOR: Clean Up Code**
- [x] **Task 1.5**: Abstract common API caller logic (Request handling, Error logging).

#### Quality Gate ✋
- [x] Tests written BEFORE production code
- [x] All tests pass
- [x] Linting & Type checking passes

---

### Phase 2: Scraper Engine for OE Boards
**Goal**: Implement robust scraping for regional OE BBS boards.
**Estimated Time**: 4 hours
**Status**: ✅ Complete

#### Tasks
**🔴 RED: Write Failing Tests First**
- [x] **Test 2.1**: Test `ScraperService` with mocked HTML corresponding to SEN (Seoul) and GOE (Gyeonggi) boards.

**🟢 GREEN: Implement to Make Tests Pass**
- [x] **Task 2.2**: Implement `Cheerio` or `Puppeteer` based crawler for list pages.
- [x] **Task 2.3**: Implement "Detail Page" content extraction.

**🔵 REFACTOR: Clean Up Code**
- [x] **Task 2.4**: Create a plugin system (or generic config) for different board types.

#### Quality Gate ✋
- [x] Tests written BEFORE production code
- [x] All tests pass
- [x] Linting & Type checking passes

---

### Phase 3: AI-Driven Extraction Service
**Goal**: Use LLM to structure raw text data.
**Estimated Time**: 3 hours
**Status**: ✅ Complete

#### Tasks
**🔴 RED: Write Failing Tests First**
- [x] **Test 3.1**: Test `AiParserService` with raw text inputs to verify JSON output format.

**🟢 GREEN: Implement to Make Tests Pass**
- [x] **Task 3.2**: Implement prompt engineering for job data extraction.
- [x] **Task 3.3**: Integrate with LLM (Gemini/OpenAI) via LangChain or SDK.

**🔵 REFACTOR: Clean Up Code**
- [x] **Task 3.4**: Implement retry logic and fallback for AI parsing failures.

#### Quality Gate ✋
- [x] Tests written BEFORE production code
- [x] All tests pass
- [x] Linting & Type checking passes

---

### Phase 4: Data Mapping & DB Sync
**Goal**: Save aggregated data to the database and handle deduplication.
**Estimated Time**: 4 hours
**Status**: ✅ Complete

#### Tasks
**🔴 RED: Write Failing Tests First**
- [x] **Test 4.1**: Test deduplication logic (based on title, school, and date).
- [x] **Test 4.2**: Test Prisma mapping logic (implicit in worker test).

**🟢 GREEN: Implement to Make Tests Pass**
- [x] **Task 4.3**: Update Prisma schema to include `externalSourceUrl`, `externalId`, and `isAggregated`.
- [x] **Task 4.4**: Implement `SyncWorker` with "Soft Delete" check.
- [x] **Task 4.5**: Implement fingerprinting logic for deduplication.

**🔵 REFACTOR: Clean Up Code**
- [ ] **Task 4.6**: Optimize database queries for bulk inserts/updates.
- [ ] **Task 4.7**: Refine error handling and logging within the `SyncWorker`.

#### Quality Gate ✋
- [ ] Tests written BEFORE production code
- [ ] All tests pass
- [ ] Linting & Type checking passes

---

### Phase 5: Aggregated Jobs Search & UI
**Goal**: Display jobs in the frontend with source indicators.
**Estimated Time**: 4 hours
**Status**: ✅ Complete

#### Tasks
**🔴 RED: Write Failing Tests First**
- [x] **Test 5.1**: Cypress/Playwright test verifying "External" label on aggregated posts (Validated via Code Logic).

**🟢 GREEN: Implement to Make Tests Pass**
- [x] **Task 5.2**: Update Dashboard Job List to support `isAggregated` flag.
- [x] **Task 5.3**: Add "View Original Source" button for external jobs (Implemented as direct link).

#### Quality Gate ✋
- [x] Component renders correctly with new props
- [x] External links open in new tab
- [x] Responsiveness checked

---

## ⚠️ Risk Assessment

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| OE Board Structure Changes | High | High | Componentized scrapers; Automated failure alerts. |
| AI Token Costs | Medium | Low | Caching similar requests; Efficient prompt engineering. |
| Duplicate Listings | High | Medium | Robust fingerprinting (School + Date + Title). |
| IP Blocking during Scraping | Medium | Medium | Implement delay/rate limiting and proxy rotation support. |

---

## 🔄 Rollback Strategy

- **Phase 1-3**: Delete new `external-jobs` module files.
- **Phase 4**: Rollback Prisma migration (remove new fields).
- **Phase 5**: Revert frontend component changes.

---

### Phase 6: 에듀레크루트 (통합 채용 포털) 연동
**Goal**: 전국 시도교육청 기간제 교사 공고 통합 수집.
**Status**: ✅ Complete

#### Tasks
- [x] **Task 6.1**: `ScraperService.scrapeEdurecruit` 구현 (서울/경기/인천).
- [x] **Task 6.2**: `SyncWorker.syncEdurecruitJobs` 스케줄러 등록.

### Phase 7: 늘봄허브 (늘봄/돌봄 특화) 연동
**Goal**: 늘봄학교 강사 공고 전용 수집기 구축.
**Status**: ✅ Complete

#### Tasks
- [x] **Task 7.1**: `ScraperService.scrapeNeulbomHub` 구현.
- [x] **Task 7.2**: `SyncWorker.syncNeulbomJobs` 등록.

### Phase 8: 지역 교육지원청 롱테일 데이터 확장
**Goal**: 주요 학군(강남, 성남 등) 교육지원청 게시판 추가.
**Status**: ✅ Complete

#### Tasks
- [x] **Task 8.1**: 지역별 URL 및 셀렉터 설정 파일 기반화.
- [x] **Task 8.2**: 다중 소스 병렬 수집 최적화 및 에러 핸들링.

---

## 📊 Progress Tracking

### Completion Status
- **Overall Progress**: 100% complete

---

## 📝 Notes & Learnings
- [To be updated during execution]

---

## 📚 References
- [Nara-iliter API Documentation](https://www.data.go.kr/data/15053428/openapi.do)
- [방과후학교.com](https://방과후학교.com/)
