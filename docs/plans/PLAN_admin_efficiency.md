# Implementation Plan: Admin Efficiency (Part 6)

**Status**: ✅ Completed
**Started**: 2026-01-04
**Last Updated**: 2026-01-04
**Estimated Completion**: 2026-01-04

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
Implementation of "Part 6: Admin Efficiency" from the master roadmap. This includes:
1.  **PDF Document Generation**: Automatically creating standard employment contracts for matched teachers/schools.
2.  **S2B Integration**: Providing guidance and links to S2B (School-to-Business) release when budget exceeds the legal threshold (20M KRW).
3.  *Note*: Sexual Offender Background Check Consent is **EXCLUDED** from this scope as per user request.

### Success Criteria
- [ ] Backend service capable of generating PDFs from HTML templates.
- [ ] "Download Contract" button available for 'HIRED' status applications.
- [ ] Job Listings with budget > 20M KRW display S2B warning/link on creation and detail view.
- [ ] Admin dashboard shows simple stats or logs of generated documents.

### User Impact
- **Schools**: Saves time drafting contracts; ensures compliance with "S2B" regulations for large budgets.
- **Teachers**: Receives standardized, professional contracts immediately upon hiring.

---

## 🏗️ Architecture Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| **Puppeteer for PDF** | High fidelity HTML-to-PDF rendering, supports complex layouts (CSS) easily. | Heavier runtime dependency (Chromium) than `pdfkit`. |
| **Frontend S2B Check** | Immediate feedback to user during input. | Client-side only validation (soft check); Backend validation added for data integrity. |
| **HTML Templates** | Easy to maintain and style contracts using standard CSS. | Requires careful sanitization of user input injected into templates. |

---

## 📦 Dependencies

### Required Before Starting
- [x] Node.js environment (Existing)
- [x] Backend NestJS setup (Existing)

### External Dependencies
- `puppeteer`: Latest stable
- `handlebars` or `ejs`: For template substitution (Choosing `handlebars` for simplicity)

---

## 🧪 Test Strategy

### Testing Approach
**TDD Principle**: Write tests FIRST, then implement.

### Test Pyramid
| Test Type | Coverage Target | Purpose |
|-----------|-----------------|---------|
| **Unit Tests** | ≥80% | PDF Service logic, Template rendering, S2B logic |
| **Integration Tests** | Critical paths | Generating a real PDF file, API endpoints |
| **E2E Tests** | Key user flows | User clicks "Download", receives PDF |

### Coverage Requirements
- **Phase 1**: PDF Service Unit Tests (Mock Puppeteer)
- **Phase 2**: Contract Generation Integration (API returns stream)
- **Phase 3**: Job Budget Logic Unit Tests

---

## 🚀 Implementation Phases

### Phase 1: PDF Service Foundation
**Goal**: Create a reusable backend service that converts HTML strings/templates to PDF buffers.
**Estimated Time**: 2 hours
**Status**: ⏳ Pending

#### Tasks

**🔴 RED: Write Failing Tests First**
- [x] **Test 1.1**: Unit test for `PdfService.generatePdf(htmlContent)`
  - File: `apps/backend/src/common/pdf/pdf.service.spec.ts`
  - Expected: Fails (Service fails to inject or Puppeteer not found)
  - Details: verify call to `browser.newPage()`, `page.pdf()`.

**🟢 GREEN: Implement to Make Tests Pass**
- [x] **Task 1.2**: Install `puppeteer`
  - Command: `npm install puppeteer`
- [x] **Task 1.3**: Implement `PdfService`
  - File: `apps/backend/src/common/pdf/pdf.service.ts`
  - Details: Launch headless browser, set content, return buffer.

**🔵 REFACTOR: Clean Up Code**
- [x] **Task 1.4**: Optimize browser instance management (Singleton or Pool if high load, strictly Singleton for now)

#### Quality Gate ✋
- [x] TDD followed (tests failed first)
- [x] PDF generation works with sample HTML

---

### Phase 2: Employment Contract Generation
**Goal**: Generate a populated contract PDF for a specific Match (JobApplication).
**Estimated Time**: 3 hours
**Status**: ⏳ Pending

#### Tasks

**🔴 RED: Write Failing Tests First**
- [x] **Test 2.1**: Test `ApplicationsController.downloadContract`
  - File: `apps/backend/src/applications/applications.controller.spec.ts`
  - Details: Expect endpoint to return `application/pdf` stream.

**🟢 GREEN: Implement to Make Tests Pass**
- [x] **Task 2.2**: Create Contract Template
  - File: `apps/backend/src/assets/templates/contract.html` (or `.hbs`)
- [x] **Task 2.3**: Implement Controller Method
  - File: `apps/backend/src/applications/applications.controller.ts`
  - Details: Fetch Job/User data, compile template, call `PdfService`, stream result.

**🔵 REFACTOR: Clean Up Code**
- [x] **Task 2.4**: Extract template compilation to a helper or `TemplateService`

#### Quality Gate ✋
- [x] "Hire" a user in local env, click download, verify PDF content.

---

### Phase 3: S2B Bridge (Budget Check)
**Goal**: Enforce/Warn about S2B usage when budget exceeds 20M KRW.
**Estimated Time**: 1 hour
**Status**: ⏳ Pending

#### Tasks

**🔴 RED: Write Failing Tests First**
- [x] **Test 3.1**: Test `JobListing` creation with high budget.
  - File: `apps/backend/src/jobs/jobs.service.spec.ts`
  - Details: Ensure backend flags it or allows it but logs warning (Decision: Allow but add `requiresS2B` flag if schema allows, or just frontend warning).
  - *Refinement*: User request implies "Bridge". Simplest backend support is a computed property or just validation. Let's just harden the Frontend logic (already planned in roadmap analysis) and add a Backend validator.

**🟢 GREEN: Implement to Make Tests Pass**
- [x] **Task 3.2**: Add `budget` field to `JobListing` (if missing) and validation.
  - File: `apps/backend/prisma/schema.prisma` (Add `budget` Int)
  - File: `apps/backend/src/jobs/dto/create-job.dto.ts`
- [x] **Task 3.3**: Update Frontend to send `budget`.

#### Quality Gate ✋
- [x] Creating a job with 25,000,000 KRW shows warning and saves correctly.

---

## 🔧 Environment Stabilization
- [x] **Fix .env Encoding**: Converted corrupted `.env` file to UTF-8.
- [x] **Configure Database URL**: Updated `.env` to use External Proxy URL (`shuttle.proxy.rlwy.net`) for local development compatibility.
- [x] **Verify Connectivity**: Confirmed `npx prisma db push` works natively.

## 📝 Notes & Learnings
- **Puppeteer**: Used `puppeteer` for robust HTML-to-PDF generation.
- **Database**: Added `budget` field to `JobListing`.
- **Environment**: Local `.env` must use the External Proxy URL (`shuttle.proxy`), while Production uses the Internal URL (`railway.internal`) via Railway Variable Injection.
- **Frontend**: Added generic `downloadFile` utility for handing blob responses.
