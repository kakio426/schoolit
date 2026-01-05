# Implementation Plan: Administrative Defense (S2B Integration & Safety UI)

**Status**: 🔄 In Progress
**Started**: 2026-01-05
**Last Updated**: 2026-01-05
**Estimated Completion**: 2026-01-06

---

**⚠️ CRITICAL INSTRUCTIONS**: After completing each phase:
1. ✅ Check off completed task checkboxes
2. 🧪 Run all quality gate validation commands
3. ⚠️ Verify ALL quality gate items pass
4. 📅 Update "Last Updated" date above
5. 📝 Document learnings in Notes section
6. ➡️ Only then proceed to next phase

---

## 📋 Overview

### Feature Description
This feature implements the **"Administrative Defense"** strategy (v2.0) to reposition Edupin as a "Safe Phonebook/Pre-search Tool." It focuses on providing schools with verifiable administrative data (S2B Number) while insulating the platform from liability through strategic UI disclaimers and the removal of risky file storage.

### Success Criteria
- [ ] S2B Number is stored and retrievable for Business profiles.
- [ ] Business profiles clearly display an "S2B Registered" badge.
- [ ] Schools see a mandatory "Pre-search Tool" disclaimer before initiating contact.
- [ ] Social Login (Kakao/Naver) is verified and functional for easy access.

### User Impact
- **Schools**: Reduced administrative friction by having S2B numbers readily available.
- **Businesses**: Increased trust and visibility for official procurement.
- **Platform Owner**: Reduced legal liability by clarifying the platform's role as a directory, not a verifier.

---

## 🏗️ Architecture Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| S2B Number in DB | Allows schools to skip manual searching on S2B portal during discovery phase. | Requires businesses to keep it updated; we don't verify its truth. |
| Mandatory Safety Popups | Ensures every user acknowledges the "Research Prototype" status. | Slight friction in UX, but necessary for legal defense. |
| Social Login as Primary | Lowers the barrier for teachers/schools to entry in a "transient" research service. | Metadata management complexity for provider-linked accounts. |

---

## 📦 Dependencies

### Required Before Starting
- [x] Removed Certification file upload functionality (Risk Management Phase 1).
- [x] Updated Footer Disclaimer.

### External Dependencies
- `passport-kakao`: ^1.0.1
- `passport-naver-v2`: ^2.0.8
- `class-validator`: For DTO safety.

---

## 🧪 Test Strategy

### Testing Approach
**TDD Principle**: Write backend DTO/Endpoint tests and Frontend component tests before implementation.

### Test Pyramid for This Feature
| Test Type | Coverage Target | Purpose |
|-----------|-----------------|---------|
| **Unit Tests** | ≥80% | DTO validation (s2bNumber format), Utility functions. |
| **Integration Tests** | Critical paths | API endpoints for Business profile updates, User profile retrieval. |
| **E2E Tests** | Key user flows | Business user saves S2B number -> School user views it. |

---

## 🚀 Implementation Phases

### Phase 1: S2B Number Foundation (Backend)
**Goal**: Persist S2B Number and provide API access.
**Status**: ⏳ Pending

#### Tasks
**🔴 RED: Write Failing Tests First**
- [ ] **Test 1.1**: Write unit tests for `UpdateBusinessProfileDto` to validate `s2bNumber`.
  - File(s): `apps/backend/src/users/dtos/update-business-profile.dto.spec.ts`
  - Expected: Fails because the DTO/Test might not be fully wired.
- [ ] **Test 1.2**: Write integration test for `PATCH /business-profiles` to accept `s2bNumber`.
  - File(s): `test/business-profile.e2e-spec.ts`
  - Expected: Fails because DB schema/Service lacks the field.

**🟢 GREEN: Implement to Make Tests Pass**
- [ ] **Task 1.3**: Add `s2bNumber` to `BusinessProfile` in `schema.prisma` and run migration.
- [ ] **Task 1.4**: Update `BusinessProfileService.createOrUpdate` to handle the new field.
- [ ] **Task 1.5**: Update `UpdateBusinessProfileDto` with validation decorators.

**🔵 REFACTOR: Clean Up Code**
- [ ] **Task 1.6**: Refactor `BusinessProfileController` to use the new DTO for strict type safety.

#### Quality Gate ✋
- [ ] Build & Type-check pass.
- [ ] `npx prisma generate` completed.
- [ ] Tests 1.1 and 1.2 pass.

---

### Phase 2: Administrative UX - Input (Frontend)
**Goal**: Allow business users to manage their S2B identity.
**Status**: ⏳ Pending

#### Tasks
**🔴 RED: Write Failing Tests First**
- [ ] **Test 2.1**: Write a Vitest/Testing-Library test for `BusinessProfileForm` to check for "S2B Number" field.
- [ ] **Test 2.2**: Write a test to ensure saving the form sends `s2bNumber` to the API.

**🟢 GREEN: Implement to Make Tests Pass**
- [ ] **Task 2.3**: Add `s2bNumber` to `formData` state in `BusinessProfileForm.tsx`.
- [ ] **Task 2.4**: Implement the UI input with "S2B" branding/styling.
- [ ] **Task 2.5**: Connect UI to the API PATCH call.

**🔵 REFACTOR: Clean Up Code**
- [ ] **Task 2.6**: Extract S2B info block into a reusable `S2BVerificationLabel` component if needed.

---

### Phase 3: Administrative UX - Visibility (Frontend)
**Goal**: Reassure schools by highlighting S2B availability.
**Status**: ⏳ Pending

#### Tasks
**🔴 RED: Write Failing Tests First**
- [ ] **Test 3.1**: Write a test for `BusinessCard` to verify "S2B Registered" badge appears if `s2bNumber` exists.

**🟢 GREEN: Implement to Make Tests Pass**
- [ ] **Task 3.2**: Add `s2bNumber` to `BusinessProfile` interface in `frontend/types`.
- [ ] **Task 3.3**: Update `BusinessCard` or Listing components to display the S2B Badge.

**🔵 REFACTOR: Clean Up Code**
- [ ] **Task 3.4**: Ensure consistent styling with the "Toss-style" premium design system.

---

### Phase 4: Social Login & Safety Hard-stop
**Goal**: Ensure easy access and mandatory warning compliance.
**Status**: ⏳ Pending

#### Tasks
**🔴 RED: Write Failing Tests First**
- [ ] **Test 4.1**: Verify Social Login redirect URLs.
- [ ] **Test 4.2**: Test that a first-time login triggers the "Research Prototype Warning" modal.

**🟢 GREEN: Implement to Make Tests Pass**
- [ ] **Task 4.3**: Connect Kakao/Naver buttons on `LoginPage.tsx`.
- [ ] **Task 4.4**: Implement `WarningModal` component that appears on first profile view or after login.

---

## ⚠️ Risk Assessment

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| S2B Data Inaccuracy | High | Med | Add a "Last Updated" timestamp and a disclaimer that schools must verify in S2B portal. |
| Social Login API Secrets | Med | High | Use `.env` files and never commit secrets. |
| Migration Failures | Low | High | Take DB backup before `prisma migrate dev`. |

---

## 🔄 Rollback Strategy
- **DB**: `npx prisma migrate diff` and manual SQL revert if needed.
- **Code**: `git revert` to the last stable commit before Phase implementation.

---

## 📝 Notes & Learnings
- Focus on "Administrative Convenience" as the primary value proposition.
