# Implementation Plan: School Profile Enhancement

**Status**: 🔄 In Progress
**Started**: 2026-01-05
**Last Updated**: 2026-01-05
**Estimated Completion**: 2026-01-06

---

## 📋 Overview

### Goal
Upgrade the simplistic School Profile to a professional, data-rich verifiable profile that builds trust with Teachers and Vendors.
Currently, the profile editing page mistakenly shows the Teacher form for School users. We will implement a dedicated School Profile workflow with expanded data points.

### Success Criteria
- [ ] **Data Model**: `SchoolProfile` supports `schoolType`, `studentCount`, `phoneNumber`, and `logoImage`.
- [ ] **Backend**: API endpoints correctly update partial school profile data.
- [ ] **Frontend**: Dedicated `SchoolProfileForm.tsx` component implemented.
- [ ] **UX**: Address search integration (Daum Postcode or similar) and Image Upload for logos.
- [ ] **Fix**: School users no longer see "Teacher Bio" or "Subjects" fields.

---

## 🏗️ Architecture Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| **Dedicated Form Component** | Separating `SchoolProfileForm` from `ProfilePage` logic ensures clear separation of concerns (vs. monolithic page). | Requires refactoring `profile/page.tsx`. |
| **Direct Schema Update** | Adding columns to `SchoolProfile` is necessary for business logic (Vendor matching needs student count). | Requires DB migration. |
| **Address Search** | Use `react-daum-postcode` for Korean address standardization. | Adds frontend dependency. |

---

## 🚀 Implementation Phases

### Phase 1: Data Modeling & Backend (Schema)
**Goal**: Expand the database schema to store rich school information.

#### Tasks
- [ ] **Schema Update**: Modify `SchoolProfile` in `schema.prisma`.
    - Add `schoolType` (Enum: ELEMENTARY, MIDDLE, HIGH, SPECIAL, VARIOUS).
    - Add `studentCount` (Int or String range).
    - Add `phoneNumber` (String).
    - Add `logoImage` (String - already exists but verify usage).
    - Add `homepage` / `tags` (String[]).
- [ ] **Migration**: Run `prisma migrate dev`.
- [ ] **DTO Update**: Update `UpdateSchoolProfileDto` in backend.
- [ ] **Controller Logic**: Ensure `UsersController` or `SchoolsController` handles the new fields safely.

### Phase 2: Frontend Foundation & API
**Goal**: Prepare the profile hook and API calls.

#### Tasks
- [ ] **Type Definitions**: Update `SchoolProfile` interface in `frontend/src/types`.
- [ ] **Hook Update**: Enhance `useProfile` hook to support `updateSchoolProfile` method (similar to `updateTeacherProfile`).
- [ ] **Address Library**: Install `react-daum-postcode`.

### Phase 3: UI Implementation (SchoolProfileForm)
**Goal**: Create the modern, section-based form UI.

#### Tasks
- [ ] **Component Creation**: `src/components/profile/SchoolProfileForm.tsx`.
    - **Section 1: Basic Info**: Name, Type, Logo (Image Upload).
    - **Section 2: Contact & Location**: Address (Search Modal), Phone, Website.
    - **Section 3: Scale & Vibe**: Student Count, Introduction, Tags.
- [ ] **Page Integration**: Modify `app/dashboard/profile/page.tsx`.
    - Check `user.role === 'SCHOOL'`.
    - Render `SchoolProfileForm` instead of generic/teacher form.

### Phase 4: Verification & Polish
**Goal**: Verify the flow and UX.

#### Tasks
- [ ] **Manual Test**: Login as School -> Edit Profile -> Save -> Refresh -> Verify Persistence.
- [ ] **Styling**: Ensure consistent margins and "Premium" feel (glassmorphism/cards) as requested.

---

## ⚠️ Risk Assessment

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| **Migration Conflict** | Low | High | Backup DB before migration. Verify `profile` relation optionality. |
| **Role Confusion** | Medium | Medium | Explicitly check `user.role` in frontend to preventing showing wrong forms. |

---

## ✅ Final Checklist
- [ ] `SchoolProfile` table has new columns.
- [ ] School users see the correct form.
- [ ] Address search works.
- [ ] Profile saves correctly.
