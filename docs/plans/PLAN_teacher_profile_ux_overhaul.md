# Implementation Plan: Teacher Profile UX Upgrade

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
Overhaul the Teacher Profile editing experience (`TeacherProfileForm.tsx`) to improve usability, accessibility, and completeness. The focus is on better input visibility (contrast), clearer instructions, and adding missing critical fields like Contact Information.

### Success Criteria
- [ ] **Contact Info**: Teachers can view and edit their "Contact Number" directly in the profile form.
- [ ] **Visual Contrast**: Input fields (School Name, Major, etc.) are clearly distinguishable from the background in both Light and Dark modes.
- [ ] **Date UI**: Date pickers are intuitive and do not occupy excessive width, making the calendar icon visible.
- [ ] **Guidance**: Portfolio section clearly suggests "YouTube, Blog, Instagram" links.
- [ ] **Section Distinctiveness**: Experience, Education, and License sections have improved color/styling for better readability.

### User Impact
Reduces friction for teachers filling out their profiles, ensuring higher data quality and fewer "how do I do this?" support questions.

---

## 🏗️ Architecture Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| **Unified Contact Editing** | Allow editing `User.phone` within `TeacherProfileForm`. | Requires `useProfile` to handle User-level updates, not just Profile-level. |
| **Input Styling Refresh** | Use higher contrast backgrounds (e.g., `bg-slate-50` vs `bg-white` container) for inputs. | Might require global CSS adjustment or `input-std` utility class update. |

---

## 📦 Dependencies

### Required Before Starting
- [x] `TeacherProfileForm.tsx` exists.
- [x] `User` model has `phone` field.

---

## 🧪 Test Strategy

### Testing Approach
**Visual Verification**: Since these are largely UI/UX changes, manual visual verification in Storybook or running app is key.

---

## 🚀 Implementation Phases

### Phase 1: Contact Information & Helper Text
**Goal**: Ensure teachers can input contact info and know what links to add.
**Estimated Time**: 30 mins
**Status**: 🔄 In Progress

#### Tasks
- [ ] **Task 1.1**: Update `BasicInfo` state to include `phone`.
- [ ] **Task 1.2**: Add Phone Input field below Name/Email in `TeacherProfileForm`.
    - *Note*: Ensure it syncs with `User.phone`.
- [ ] **Task 1.3**: Add Helper Text to `LinkSection` ("유튜브, 블로그, 인스타그램 등 포트폴리오 URL을 입력해주세요").

#### Quality Gate ✋
**Manual Review**:
- [ ] Can type in phone number.
- [ ] Link section shows the new hint text.

---

### Phase 2: Visual Polish (Contrast & Layout)
**Goal**: Fix the "invisible input" and awkward date picker issues.
**Estimated Time**: 45 mins
**Status**: ⏳ Pending

#### Tasks
- [ ] **Task 2.1**: Update `input-std` class in `TeacherProfileForm` (or global) to have better contrast.
    - Suggestion: Use `border-slate-300` (darker border) and `bg-slate-50` (slight tint) for inputs to distinguish from white container.
- [ ] **Task 2.2**: Optimize Date Input width.
    - Change `width: 100%` to `w-fit` or specific pixel width for Date inputs to prevent stretching.
- [ ] **Task 2.3**: Refine Colors for Experience/Education/License cards.
    - Use distinct border colors or subtle background tints for each section to differentiate them.

#### Quality Gate ✋
**Manual Review**:
- [ ] Inputs are clearly visible against the white card background.
- [ ] Date picker icon is easily clickable.
- [ ] Section cards look distinct and "clean".

---

## ⚠️ Risk Assessment

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| **Dark Mode Conflicts** | Medium | Low | Test all color changes in both Light/Dark modes immediately. |

---
