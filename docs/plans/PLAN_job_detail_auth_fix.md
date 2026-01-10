# Implementation Plan: Job Detail Optional Auth Fix

**Status**: ✅ Complete
**Started**: 2026-01-10
**Last Updated**: 2026-01-10
**Estimated Completion**: 2026-01-10

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
The `GET /jobs/:id` endpoint currently treats all requests as public, ignoring JWT tokens even if sent. This prevents the system from knowing if a user has already applied for a job. We need to implement an `OptionalJwtAuthGuard` that authenticates the user if a token is present but allows access if it is missing.

### Success Criteria
- [ ] `GET /jobs/:id` accepts requests without a token (Public access).
- [ ] `GET /jobs/:id` extracts `req.user` when a valid Bearer token is provided.
- [ ] `JobsService.findOne` receives the correct `userId` for authenticated requests.
- [ ] Existing public access remains uninterrupted.

### User Impact
- Authenticated users will see their application status (`hasApplied`) correctly on the job detail page.
- "Easy Apply" button will accurately reflect the user's state.

---

## 🏗️ Architecture Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| Use `OptionalJwtAuthGuard` | Specific guard to handle "try auth, continue if fail" logic is standard NestJS pattern. | Requires custom class definition (small overhead). |
| Inline Guard in Controller | For this small fix, keeping it in the controller file is expedient, though usually guards go in `auth/`. | Slightly couples guard to controller file, but acceptable for this scope. |

---

## 📦 Dependencies

### Required Before Starting
- [x] Existing `JobsController` and `JobsService`
- [x] `AuthGuard('jwt')` strategy configured

---

## 🧪 Test Strategy

### Testing Approach
**TDD Principle**: Will verify current behavior with tests, ensuring they fail (or pass if code exists), then ensure full coverage for the optional auth scenario.

### Test Pyramid for This Feature
| Test Type | Coverage Target | Purpose |
|-----------|-----------------|---------|
| **Unit Tests** | 100% | Verify Guard logic (handleRequest). |
| **E2E Tests** | 1 cover | Verify Controller handles both valid token and no token. |

### Test File Organization
```
apps/backend/test/include/jobs/
└── jobs-optional-auth.e2e-spec.ts
```

---

## 🚀 Implementation Phases

### Phase 1: Test & Verify (Foundation)
**Goal**: Establish a failing test (or verifying test) for the optional auth requirement.
**Estimated Time**: 1 hour
**Status**: 🔄 In Progress

#### Tasks

**🔴 RED: Write Failing Tests First**
- [ ] **Test 1.1**: Create E2E test `apps/backend/test/jobs-optional-auth.e2e-spec.ts`
  - Ensure `GET /jobs/:id` works for anonymous (200 OK).
  - Ensure `GET /jobs/:id` with Valid Token returns user specific data (mock service to verify userId was passed).
  - Expected: Fails if `userId` is passed as undefined/null when token is present (current known bug/limitation before fix).

**🟢 GREEN: Implement to Make Tests Pass**
- [ ] **Task 1.2**: Define `OptionalJwtAuthGuard` in `jobs.controller.ts`.
- [ ] **Task 1.3**: Apply `@UseGuards(OptionalJwtAuthGuard)` to `findOne`.
- [ ] **Task 1.4**: Update `findOne` to extract `req.user?.userId`.
*(Note: Code already exists, will be verified by tests)*

**🔵 REFACTOR: Clean Up Code**
- [ ] **Task 1.5**: Ensure `OptionalJwtAuthGuard` handles errors gracefully (returns user or null).

#### Quality Gate ✋

**⚠️ STOP: Do NOT proceed to Phase 2 until ALL checks pass**

**TDD Compliance**:
- [ ] **Red Phase**: Tests confirmed failure (or would fail without the fix).
- [ ] **Green Phase**: Fix applied, tests pass.

**Build & Tests**:
- [ ] **Build**: `npm run build` passes.
- [ ] **All Tests Pass**: `npm test` passes (specifically the new E2E).

---

## ⚠️ Risk Assessment

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| Public access breaks | Low | High | E2E test specifically checks anonymous access. |
| Token validation failure blocks access | Medium | Medium | Guard `handleRequest` must explicitly return `user || null` and NOT throw error. |

---

## 🔄 Rollback Strategy

### If Phase 1 Fails
**Steps to revert**:
- Remove `@UseGuards(OptionalJwtAuthGuard)` from `findOne`.
- Revert `OptionalJwtAuthGuard` class definition.

---

## 📊 Progress Tracking

### Completion Status
- **Phase 1**: ⏳ 0%

---

## 📝 Notes & Learnings

### Implementation Notes
- The `OptionalJwtAuthGuard` needs to override `handleRequest` to prevent the default `AuthGuard` behavior of throwing 401 on missing/invalid token.
