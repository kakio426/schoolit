# Implementation Plan: UX Verification & Flow Audit

**Status**: 🔄 In Progress
**Started**: 2026-01-05
**Last Updated**: 2026-01-05
**Estimated Completion**: 2026-01-05

---

**⚠️ CRITICAL INSTRUCTIONS**: This plan is for **manual verification** of the user experience.
1. ✅ Follow the step-by-step guides below.
2. 📝 Note any UI glitches, awkward flows, or missing feedback.
3. ➡️ Proceed to fix identified issues (if any) in subsequent tasks.

---

## 📋 Overview

### Goal
Verify that the current "Dual Job Listing" system (Teacher Hiring & Event Vendor) provides a seamless and intuitive user experience for all three key roles: **School**, **Teacher**, and **Event Vendor**.

### Success Criteria
- [ ] **School Flow**: Can post both job types, manage applicants, chat, hire, and complete activities.
- [ ] **Teacher Flow**: Can find "Teacher Hiring" jobs, apply, accept interviews, and write reviews.
- [ ] **Vendor Flow**: Can find "Event Vendor" jobs, apply with cost proposals, and communicate via chat.
- [ ] **UI Consistency**: "Complete Activity" and "Write Review" buttons appear at correct states.

---

## 🏗️ Verification Phases

### Phase 1: Teacher Hiring Cycle (School ↔ Teacher)
**Goal**: Verify the end-to-end flow for a typical teacher recruitment.

#### 🧪 Manual Test Script

**Step 1.1: School Post Job**
- [ ] Login as **School Account**.
- [ ] Navigate to `Dashboard` > `New Job`.
- [ ] Select **"Teacher Hiring"** (기간제 교사 채용).
- [ ] Fill mandatory fields (Title, Subject: Math, Period: 6 months).
- [ ] **Assert**: Job appears in "My Jobs" list with "Active" badge.

**Step 1.2: Teacher Apply**
- [ ] Login as **Teacher Account**.
- [ ] Navigate to `Dashboard` > `Find Jobs`.
- [ ] Click on the job posted above.
- [ ] Click "Apply" (Subject/Grade should be visible).
- [ ] Submit application.
- [ ] **Assert**: "Already Applied" badge appears on job detail.

**Step 1.3: School Interview & Hiring**
- [ ] Login as **School Account**.
- [ ] Go to `Dashboard` > `My Jobs` > Select Job > `Applicants`.
- [ ] Find the teacher. Click **"Message (Interview)"**.
- [ ] **Assert**: Chat room opens. **Check**: File attachment button (📎) exists.
- [ ] Back to Applicants list. Click **"Hire (Accept)"** (채용 확정).
- [ ] **Assert**: Status becomes `HIRED`.
- [ ] **CRITICAL**: Click **"✅ 활동 종료 (완료 처리)"** (New Button).
- [ ] **Assert**: Status becomes `COMPLETED`.

**Step 1.4: Mutual Review**
- [ ] (School) Click **"⭐ Write Review"** below the status. Submit review.
- [ ] Login as **Teacher Account**.
- [ ] Go to `Dashboard` > `My Applications`.
- [ ] Verify badge says "Activity Completed".
- [ ] Click **"⭐ Write Review"**. Submit.

---

### Phase 2: Event Vendor Cycle (School ↔ Business)
**Goal**: Verify specialized Event Vendor UI features.

#### 🧪 Manual Test Script

**Step 2.1: School Post Event**
- [ ] Login as **School Account**.
- [ ] `New Job` > Select **"Event Vendor"** (방과후/행사 업체).
- [ ] Fill fields (Budget, Event Date).

**Step 2.2: Vendor Proposal**
- [ ] Login as **Business Account**.
- [ ] Find the Event Job.
- [ ] **Assert**: Application form shows **"Proposal Cost"** and **"Contact Info"** inputs.
- [ ] Fill Cost: "500,000", Contact: "Manager Kim".
- [ ] Submit.

**Step 2.3: Proposal Check**
- [ ] Login as **School Account**.
- [ ] Go to Applicants.
- [ ] Open the Vendor's application.
- [ ] **Assert**: Message box displays "[Proposal Summary]" with Cost and Contact info.

---

## 📝 Notes & Learnings

### Implementation Notes
- **Testability Feature**: A "Complete Activity" button was added to the School's applicant view during `feat: Add job completion workflow`. This allows instantaneous testing of the review cycle without waiting for contract dates.

### Issues Found
- [ ] (User to fill during test)

---

## ✅ Final Checklist
- [ ] All flows completed successfully.
- [ ] No critical UI bugs found.
