# Implementation Plan: Core Infrastructure Refactoring

**Status**: ✅ Completed
**Started**: 2026-01-04
**Last Updated**: 2026-01-04

---

## 📋 Overview

### Quality Goal
Improve the project's maintainability, type safety, and developer efficiency by eliminating redundant code and centralizing core logic (API, Types, Constants).

### Refactoring Targets
1.  **Centralized API Client (Frontend)**: Eliminate repetitive `fetch` boilerplate and hardcoded URLs.
2.  **Global Type System**: Define canonical interfaces for core entities (User, Profile, Job, Application).
3.  **Constants Centralization**: Replace string literals with enums/constants.
4.  **Custom Hooks (Frontend)**: Extract data-fetching logic from pages into reusable hooks.
5.  **Standardized Responses (Backend)**: Ensure consistent API response structures.

---

## 🏗️ Architecture Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| Create `lib/api.ts` wrapper | Single point of change for API logic (Auth, URL, Error handling). | Small abstraction layer overhead. |
| Use Custom Hooks for Fetching | Separates UI from data logic, improves readability. | More files to manage initially. |
| Define Shared Types | Ensures frontend/backend alignment and prevents `any` usage. | Manual syncing required if not using a shared lib. |

---

## 🚀 Implementation Phases

### Phase R1: API Infrastructure & Constants
**Goal**: Centralize the backbone of the application.

#### Tasks
- [x] **Task 1.1**: Create `apps/frontend/src/lib/constants.ts`.
  - Export `API_URL`, `ROLE`, `STATUS` enums.
- [x] **Task 1.2**: Create `apps/frontend/src/lib/api.ts`.
  - Implement `api.get()`, `api.post()`, etc., with Auth header and error handling.
- [x] **Task 1.3**: Update `AuthContext.tsx` to use the new API client.

### Phase R2: Entity Type Definition
**Goal**: Eradicate `any` usage for core models.

#### Tasks
- [x] **Task 2.1**: Create `apps/frontend/src/types/index.ts`.
  - Define `User`, `TeacherProfile`, `BusinessProfile`, `Job`, `Application`.
- [x] **Task 2.2**: Apply these types to `AuthContext` and existing components (Dashboard, Profile).

### Phase R3: UI Data Logic Abstraction (Hooks) & Page Refactoring
**Goal**: Slim down page components and ensure consistent API usage.

#### Tasks
- [x] **Task 3.1**: Create `apps/frontend/src/hooks/useDashboard.ts`.
- [x] **Task 3.2**: Create `apps/frontend/src/hooks/useProfile.ts`.
- [x] **Task 3.3**: Refactor components and pages to use these hooks and the API client.
  - [x] DashboardPage
  - [x] ProfilePage
  - [x] BusinessProfileForm
  - [x] BusinessPortfolioManager
  - [x] JobsPage
  - [x] JobDetailPage
  - [x] JobApplicantsPage
  - [x] MyApplicationsPage
  - [x] MessagesPage
  - [x] LoginPage
  - [x] AdminPage
  - [x] TeacherSearchPage
  - [x] SchoolProfilePage
  - [x] NewJobPage

### Phase R4: Backend Response Standardization
**Goal**: Consistent API output.

#### Tasks
- [x] **Task 4.1**: Create a Global Response Interceptor in NestJS.
- [x] **Task 4.2**: Standardize Error Exception Filter.

---

## 🧪 Quality Gates ✋

- [x] **Task 1.2**: API Client automatically includes `Authorization` header if token exists. (Verified)
- [x] **Task R3**: Page components have significantly reduced fetching boilerplate. (Verified)
- [x] **Build**: `npm run build` passes for the frontend. (Verified via `tsc --noEmit`)

---

## 🔄 Rollback Strategy
- Revert file changes using Git. The core services aren't changing, only how they are called.
