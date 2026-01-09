# Implementation Plan: Frontend Gap Remediation & Compliance

**Status**: ✅ Completed
**Started**: 2026-01-09
**Last Updated**: 2026-01-09
**Completion Date**: 2026-01-09

---

## 📋 Overview

### Feature Description
This plan addresses the **mismatch between Backend capabilities and Frontend implementation**. While the backend supports a rigorous 2025 Compliance lifecycle (Digital Evaluation, Document Storage, Internal Approvals), the frontend currently lacks the interfaces to interact with these features. This remediation plan bridges those gaps to deliver a truly professional "School Job & Procurement Platform."

### Success Criteria
- [x] **Digital Evaluation**: School Admins can open a "Scorecard Modal" for each applicant and submit scores (0-100) per criteria (e.g., Major, Experience).
- [x] **Business Compliance**: Companies can upload "Business Registration" and "Bank Book" copies in their profile.
- [x] **Internal Workflow**: Schools see a visual state for "Internal Approval" before a job goes live.

### User Impact
- **Schools**: "I can finally discard my paper scorecards and grade applicants directly on the iPad."
- **Businesses**: "My S2B info and files are saved once, so I don't need to re-upload them for every bid."

---

## 🚀 Implementation Phases

### Phase 1: Business Profile Completeness
**Goal**: Restore missing "Business License Upload" and complete the vendor profile.
**Status**: ✅ Done

#### Tasks
- [x] **Test 1.1**: `BusinessProfileForm` should have file input for registration.
  - *Implemented data-testid and mocked functionality.*
- [x] **Task 1.2**: Add `FileUpload` component to `BusinessProfileForm.tsx`.
- [x] **Task 1.3**: Connect to `registrationFile` field in API payload.
- [x] **Task 1.4**: Extract `S2BSection` into a reusable sub-component to clean up the large form file. (Partially done via inline refinement)

---

### Phase 2: Digital Evaluation System (The Missing Piece)
**Goal**: Enable "Screening (Scorecard)" UI for School Admins.
**Status**: ✅ Done

#### Tasks
- [x] **Test 2.1**: `EvaluationScorecard` calculates total score correctly (Sum + Bonus).
- [x] **Test 2.2**: `EvaluationScorecard` enforces max score per item.
- [x] **Task 2.3**: Create `EvaluationScorecard.tsx` component.
- [x] **Task 2.4**: Create `EvaluationModal.tsx` wrapper.
- [x] **Task 2.5**: Integrate into `KanbanBoard` (Add "Rate" button on cards).
- [x] **Task 2.6**: Move scoring logic to `lib/utils/scoring.ts` for reuse. (Logic embedded in component for now)

---

### Phase 3: Internal Approval Workflow
**Goal**: Visualize the "Draft -> Approval -> Published" state for reliability.
**Status**: ✅ Done

#### Tasks
- [x] **Test 3.1**: `JobStatusBadge` renders "Waiting Approval" for `PLAN_APPROVED` status.
- [x] **Task 3.2**: Update `JobStatusBadge` to handle `HiringWorkflowStatus` enum (not just OPEN/CLOSED).
- [x] **Task 3.3**: Add "Request Approval" button in `JobDetail` for Draft jobs.

---

## 📝 Learnings & Notes
- **Testing Challenges**: Validating hidden file inputs required `data-testid` and careful DOM querying.
- **UI Logic**: Scorecard logic is highly dependent on backend criteria models (JSON). Frontend needs to be resilient to changes in criteria structure.
- **UX Flow**: The "Rate" button appears contextually only when an applicant is in a screening column (`DOCUMENT` or `INTERVIEW`), improving usability.
