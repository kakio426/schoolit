# Implementation Plan: Design System Overhaul (Smart Edu-Tech)

**Status**: 🔄 In Progress
**Started**: 2026-01-06
**Last Updated**: 2026-01-06
**Estimated Completion**: 2026-01-07

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
Implementation of the "Smart Edu-Tech" design language, inspired by Toss and Wanted. This overhaul aims to solve existing visibility inconsistencies by adopting a clean, high-contrast, and professional aesthetic. The design relies on a specific "Toss Blue" primary color, cool gray backgrounds, and strict typography rules to ensure readability on all devices.

### Success Criteria
- [ ] **Theme Adherence**: Application uses the specified "Smart Edu-Tech" palette (#3182F6, #F2F4F6, #191F28).
- [ ] **Readability**: All body text has `word-break: keep-all` applied to prevent Korean word splitting.
- [ ] **Visibility**: No "invisible" text or inputs in either light or dark modes (though focus is primarily on the clean light theme described, dark mode mappings must remain legible).
- [ ] **Layout Safety**: No overflow content is hidden without user ability to access it; containers expand to fit text.

### User Impact
- **Trust**: Professional "Financial/Tech" aesthetic builds trust with School Administrators.
- **Usability**: High contrast and "keep-all" text improves reading speed and comprehension.
- **Modernity**: Updates the app to feel current (2025/2026 standard).

---

## 🏗️ Architecture Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| **Smart Edu-Tech Palette** | Proven, high-trust color scheme (Toss/Wanted). | Less "unique" brand identity, but highly functional and familiar. |
| **Global `keep-all`** | Essential for Korean text readability. | May cause uneven line ragging on very narrow screens (requires careful padding). |
| **Token-Based Styling** | Use CSS variables for all key colors. | Migration effort, but allows for easier tweaking of the exact blue/gray shades later. |

---

## 📦 Dependencies

### Required Before Starting
- [ ] `apps/frontend/src/app/globals.css`: To be replaced with new token definitions.
- [ ] `tailwind.config.ts`: May need updates to extend colors with new semantic names.

---

## 🧪 Test Strategy

### Testing Approach
**Visual & Layout Verification**:
- Check "Korean Word Splitting" on multiple screen widths.
- Verify "Toss Blue" visibility against "Cool Gray" backgrounds.

### Manual Test Checklist
- [ ] **Typography**: Check a paragraph of Korean text. Does it break mid-word? (Should not).
- [ ] **Inputs**: Are inputs clearly distinct from the `#F2F4F6` background? (Should use White #FFFFFF).
- [ ] **Buttons**: Is the Primary Button `#3182F6` and large enough (min 56px height)?

---

## 🚀 Implementation Phases

### Phase 1: Foundation (Smart Edu-Tech Tokens)
**Goal**: Establish the "Smart Edu-Tech" color system and global typography rules in `globals.css`.
**Estimated Time**: 2 hours
**Status**: ⏳ Pending

#### Tasks

**🔴 RED: Write Failing Tests First** (Visual/Config)
- [ ] **Task 1.1**: Audit current colors. Identify where "Deep Blue" or "Generic Gray" is used.
- [ ] **Task 1.2**: Define the strict palette map.
    - `Primary`: `#3182F6` (Action)
    - `Background`: `#F2F4F6` (App Background)
    - `Surface`: `#FFFFFF` (Card/Input Background)
    - `Text Main`: `#191F28` (Headings/Body)
    - `Text Sub`: `#4E5968` (Description)
    - `Success`: `#00D082`
    - `Error`: `#FF4D4F`

**🟢 GREEN: Implement Tokens**
- [ ] **Task 1.3**: Update `apps/frontend/src/app/globals.css`.
    - Implement the variables above.
    - **CRITICAL**: Add global CSS rule: `* { word-break: keep-all; }` (or distinct class `.korean-text`) to prevent word splitting.
    - Set default body background to `var(--background)` (#F2F4F6).
    - Set default text color to `var(--text-main)` (#191F28).

**🔵 REFACTOR: Tailwind Config**
- [ ] **Task 1.4**: Update `tailwind.config.ts` (if applicable) or ensure Tailwind uses CSS variables for `bg-primary`, `text-primary`, etc.

#### Quality Gate ✋
- [ ] **Build**: No build errors.
- [ ] **Visual**: Home page background changes to Cool Gray (#F2F4F6). Text becomes Graphite (#191F28).

---

### Phase 2: Core Component Overhaul
**Goal**: Update `Button`, `Input`, `Card` to match the "Smart" aesthetic (Rounded, clean, high contrast).
**Estimated Time**: 2 hours
**Status**: ⏳ Pending

#### Tasks

**🟢 GREEN: Update Components**
- [ ] **Task 2.1**: **Button Component**
    - Apply `bg-[#3182F6]`.
    - Ensure `min-height: 56px` for main actions.
    - Radius: Large/Rounded (e.g., `rounded-2xl` or `24px` as per "PremiumDesignGuide").
- [ ] **Task 2.2**: **Input Component**
    - Background: `White (#FFFFFF)`.
    - Border: Minimal or none focused? (Toss style usually flat white on gray, or subtle border). Let's use `border-slate-200` initially.
    - Text: `#191F28`.
- [ ] **Task 2.3**: **Card Container**
    - Background: `White (#FFFFFF)`.
    - Radius: `24px` or `32px`.
    - Shadow: Soft, diffuse shadow.

#### Quality Gate ✋
- [ ] **Button Check**: Does the primary button look like the "Toss" button?
- [ ] **Input Check**: Is it clearly visible on the gray background?

---

### Phase 3: Screen Specific Application
**Goal**: Apply these new components and layout rules to the specific broken screens (Job Detail, Profile).
**Estimated Time**: 2-3 hours
**Status**: ⏳ Pending

#### Tasks

**🟢 GREEN: Fix Layouts**
- [ ] **Task 3.1**: **Job Application View**
    - Update "Private Memo" area to use `Surface (#FFFFFF)` with a subtle accent border, rather than a hardcoded colored block, or use a distinct "Note" style consistent with the theme.
    - Ensure "steps" (Receipt, Review) use the new Status colors.
- [ ] **Task 3.2**: **Teacher Profile**
    - Expand containers for "Introduction" text. Ensure no truncation.
    - Apply `word-break: keep-all`.
- [ ] **Task 3.3**: **Dark Mode Compatibility (Safety)**
    - For this specific "Smart Edu-Tech" theme, define reasonable Dark Mode mappings.
    - `Background`: `#101010` (Dark Gray/Black).
    - `Surface`: `#202020`.
    - `Text`: `#FFFFFF`.
    - `Primary`: `#3182F6` (Keep same or slightly lighter `#5C9DFF`).
    - *Goal*: Ensure nothing becomes invisible.

#### Quality Gate ✋
- [ ] **Review**: Compare with screenshots.
- [ ] **Safety**: Check for text overflow.

---

## 📊 Progress Tracking

### Completion Status
- **Phase 1**: ⏳ 0%
- **Phase 2**: ⏳ 0%
- **Phase 3**: ⏳ 0%

**Overall Progress**: 0% complete
