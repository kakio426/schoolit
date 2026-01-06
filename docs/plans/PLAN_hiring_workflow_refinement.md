# Implementation Plan: Hiring Workflow Refinement

**Status**: 🔄 In Progress
**Started**: 2026-01-06
**Last Updated**: 2026-01-06
**Estimated Completion**: 2026-01-06

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
Enhance the hiring workflow to be fully reversible, specifically addressing the inability to revert from "HIRED" (Final) and "PAYMENT_COMPLETED" (Final) states. This ensures that if a mistake is made or a situation changes (e.g., hiring cancellation after confirmation), the school can revert the status to a previous active state.

### Success Criteria
- [ ] **Tab Visibility**: `REJECTED` tab is visible and lists rejected applicants.
- [ ] **Restoration**: "Rejected" applicants can be restored to `PENDING`.
- [ ] **Full Reversibility**: Users can move backward from *any* stage (including `DOCUMENT_SCREENING` -> `PENDING`).
- [ ] **Final Stage Revert**: Can revert `HIRED` -> `VERIFICATION` and `PAYMENT_COMPLETED` -> `EXECUTING`.
- [ ] UI clearly distinguishes between positive (Next) and neutral/negative (Back/Reject) actions.

---

## 🏗️ Architecture Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| **Linear Reversibility** | Transitions are strictly `Current` -> `Current - 1`. | Predictable but slow for multi-step reverts. |
| **Visible Rejected Tab** | Rejected applicants should not disappear. | Adds clutter if many rejections; can be placed at end. |

---

## 📦 Dependencies

### Required Before Starting
- [x] Existing `JobApplicantsPage.tsx` with partial reversibility.
- [x] `ApplicationStatus` enum.

---

## 🧪 Test Strategy

### Testing Approach
**Validation**: Manual verification of state transitions in the UI.

---

## 🚀 Implementation Phases

### Phase 1: Workflow Integrity (Recovery & Visibility)
**Goal**: Ensure no dead-ends (Rejected user recovery) and full visibility (Rejected tab).
**Estimated Time**: 1 hour
**Status**: 🔄 In Progress

#### Tasks
**🔴 RED: Write Failing Tests First**
- [ ] **Test 1.1**: (Manual) Confirm `REJECTED` applicants disappear from UI.
- [ ] **Test 1.2**: (Manual) Confirm no way to revert `DOCUMENT_SCREENING` to `PENDING`.

**🟢 GREEN: Implement to Make Tests Pass**
- [ ] **Task 1.3**: Add `REJECTED` ({ id: 'REJECTED', label: '탈락/반려', icon: '🚫' }) to `teacherStages` and `eventStages` arrays in `page.tsx`.
- [ ] **Task 1.4**: Add "Restoration" (↩️ 재검토/복구) button for applicants in `REJECTED` status -> moves to `PENDING`.
- [ ] **Task 1.5**: Add "Previous Step" button for `DOCUMENT_SCREENING` (-> `PENDING`) and `BIDDING` (-> `PENDING`).

**🔵 REFACTOR: Clean Up Code**
- [ ] **Task 1.6**: Ensure button styling is consistent.

#### Quality Gate ✋
**⚠️ STOP: Do NOT proceed until ALL checks pass**
**Manual Testing**:
- [ ] **Visibility**: Reject an applicant -> Go to Rejected Tab -> Applicant is there.
- [ ] **Restoration**: Click "Restore" -> Applicant goes to Pending.
- [ ] **Early Revert**: `DOCUMENT` -> Click Back -> Verified `PENDING`.

---

### Phase 2: Final Stage Reversibility
**Goal**: Enable "Undo" for HIRED and PAYMENT_COMPLETED states.
**Estimated Time**: 1 hour
**Status**: ⏳ Pending

#### Tasks
**🔴 RED: Write Failing Tests First**
- [ ] **Test 2.1**: (Manual) Confirm `HIRED` state shows no revert button.

**🟢 GREEN: Implement to Make Tests Pass**
- [ ] **Task 2.2**: Update `JobApplicantsPage.tsx`
  - Add `↩️ 채용 취소` (HIRED -> VERIFICATION).
  - Add `↩️ 지급 취소` (PAYMENT -> EXECUTING).

#### Quality Gate ✋
**All Checks Pass**:
- [ ] **Revert Hiring**: Verified `HIRED` -> `VERIFICATION`.
- [ ] **Revert Payment**: Verified `PAYMENT` -> `EXECUTING`.

---

## ⚠️ Risk Assessment

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| **Accidental Reversion** | Medium | High | Add `confirm()` dialog for reversion actions. |
| **Notification Spam** | Low | Low | Backend sends notifications on status change; reverting might send "Status Update" again. Acceptable for now. |

---

## 🔄 Rollback Strategy

### If Phase 1 Fails
**Steps to revert**:
- Remove the new buttons from `JobApplicantsPage.tsx`.

---
