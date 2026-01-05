# Implementation Plan: Teacher Profile Enhancement

**Status**: 🔄 In Progress
**Started**: 2026-01-05
**Estimated Completion**: 2026-01-06

---

## 📋 Overview

### Goal
Upgrade the generic Teacher Profile to a comprehensive "Resumé-style" profile.
Currently, the profile only allows a bio, subjects, and regions. We will introduce structured data for Experience, Education, and External Links to increase trust and matching accuracy.

### Success Criteria
- [ ] **Data Model**: New models `TeacherExperience`, `TeacherEducation`, `TeacherLink`.
- [ ] **Backend**: API endpoints to manage these sub-resources (CRUD).
- [ ] **Frontend**: New `TeacherProfileForm.tsx` with dedicated sections.
- [ ] **UX**: Visual timeline or list for Experience/Education.

---

## 🏗️ Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **Separate Tables** | Storing Experience/Education in separate tables (`1:N`) allows structured queries and future-proofing (vs. JSON columns). |
| **Component Split** | `TeacherProfileForm` will be a heavy component. We will split sub-forms (e.g., `ExperienceSection`, `EducationSection`) for maintainability. |

---

## 🚀 Implementation Phases

### Phase 1: Data Modeling (Schema)
**Goal**: Create relational tables for rich profile data.

#### Tasks
- [ ] **Schema Update**: Modify `schema.prisma`.
    - `model TeacherExperience`: `title`, `organization`, `startDate`, `endDate`, `description`.
    - `model TeacherEducation`: `schoolName`, `degree`, `major`, `graduationStatus`.
    - `model TeacherLink`: `title`, `url`.
    - Update `TeacherProfile`: Add `targetGrades` (Enum/Array).
- [ ] **Migration**: Run `prisma migrate dev`.

### Phase 2: Backend API
**Goal**: CRUD endpoints for profile details.

#### Tasks
- [ ] **DTOs**: Create `CreateExperienceDto`, `UpdateExperienceDto`, etc.
- [ ] **Service & Controller**: Add methods to `UsersController` (or separate `TeacherProfileController` if it grows too large) to handle adding/removing experience items.
    - `POST /users/teacher/experience`
    - `DELETE /users/teacher/experience/:id`

### Phase 3: Frontend UI Implementation
**Goal**: A professional, multi-section profile editor.

#### Tasks
- [ ] **Component Creation**:
    - `TeacherProfileForm.tsx`: Main container.
    - `ExperienceList.tsx`: List + Add Modal for work history.
    - `EducationList.tsx`: List + Add Modal for academic history.
- [ ] **Hook Integration**: Update `useProfile` to fetch and mutate these new relations.
- [ ] **Page Integration**: Replace the generic form in `profile/page.tsx` with `TeacherProfileForm`.

---

## ⚠️ Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| **UI Complexity** | Medium | The form might become too long. Use accordion or tabs if "Basic Info" and "History" get too crowded. |
| **Migration Data** | Low | Existing users have no data in new tables, so no data loss risk. |

---
## ✅ Final Checklist
- [ ] Users can add/edit/delete experience items.
- [ ] Education history is displayed correctly.
- [ ] Profile page looks professional (comparable to LinkedIn/Resume).
