# Implementation Plan: Phase 11 - Matching & Communication

**Status**: 🔄 In Progress
**Started**: 2026-01-02
**Last Updated**: 2026-01-02
**Estimated Completion**: 2026-01-03

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
Implementation of the "Matching & Communication" phase (Part 4 of Master Roadmap). This involves enabling Schools to "Suggest" jobs to teachers, extending the application status workflow (Interviewing, Hired), and establishing a real-time Chat system for communication between matched parties.

### Success Criteria
- [ ] Schools can "Suggest" a job to a specific Teacher.
- [ ] Application status can transition to `INTERVIEWING` and `HIRED`.
- [ ] When status is `INTERVIEWING`, a verified Chat Room is created.
- [ ] Users (School/Teacher) can exchange messages in real-time (or near real-time via polling).
- [ ] Personal contact info stays hidden until a specific status (e.g., ACCEPTED/HIRED).

### User Impact
- **Schools**: Proactively recruit talent instead of waiting for applicants.
- **Teachers**: Receive job offers directly.
- **Both**: Communicate safely within the platform without exposing personal phone numbers initially.

---

## 🏗️ Architecture Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| **Polling for Chat** | Simplest implementation for MVP (Phase 11). | Not truly real-time, higher server load than WebSockets. (Will upgrade to Socket.io in Phase 12 or later). |
| **Prisma for Messages** | Store messages directly in Postgres via Prisma. | Strong consistency, relational integrity. Scaling concerns for massive chat logs (acceptable for now). |
| **Suggestion as Application** | "Suggestion" is modeled as a `JobApplication` with `isSuggestion=true`. | Reuses existing `JobApplication` table and logic; simplifies status tracking. |

---

## 📦 Dependencies

### Required Before Starting
- [x] Phase 10 (Search & Matching) completed.
- [x] `User`, `SchoolProfile`, `TeacherProfile` models stable.

### External Dependencies
- None additional (Uses existing Prisma/NestJS stack).

---

## 🧪 Test Strategy

### Testing Approach
**TDD Principle**: Write tests FIRST. Specifically for the ChatService and the Suggestion logic.

### Test Pyramid for This Feature
| Test Type | Coverage Target | Purpose |
|-----------|-----------------|---------|
| **Unit Tests** | ≥80% | `ChatService`, `ApplicationsService` (suggestion logic). |
| **Integration Tests** | Critical paths | Chat flow (Room creation -> Messaging), Suggestion flow. |
| **E2E Tests** | 1 Flow | Full "Suggest -> Accept -> Chat" walkthrough. |

### Test File Organization
```
apps/backend/test/
├── unit/
│   └── chat.service.spec.ts
├── integration/
│   └── chat.flow.spec.ts
└── e2e/
    └── communication.e2e-spec.ts
```

---

## 🚀 Implementation Phases

### Phase 11.1: Database & Core Models
**Goal**: Update Schema to support Chat and extended Statuses.
**Estimated Time**: 1 hour
**Status**: ✅ Complete

#### Tasks

**🔴 RED: Write Failing Tests First**
- [x] **Test 11.1.1**: Unit test for `ChatService` (placeholder).
  - Expect failure: Service doesn't exist.

**🟢 GREEN: Implement to Make Tests Pass**
- [x] **Task 11.1.2**: Update `schema.prisma`.
  - Add `ChatRoom`, `ChatMessage`.
  - Update `ApplicationStatus` (`INTERVIEWING`, `HIRED`).
  - Add `isSuggestion` to `JobApplication`.
- [x] **Task 11.1.3**: Run Migration (`npx prisma migrate dev`).

**🔵 REFACTOR: Clean Up Code**
- [x] **Task 11.1.4**: Verify relations in Prisma Client.

#### Quality Gate ✋
- [x] Build passes.
- [x] Migration successful.

---

### Phase 11.2: Suggestion Flow (Backend)
**Goal**: Allow Schools to suggest jobs.
**Estimated Time**: 2 hours
**Status**: ✅ Complete

#### Tasks

**🔴 RED: Write Failing Tests First**
- [ ] **Test 11.2.1**: Unit tests for `ApplicationsService.suggestJob`.
  - Case: Suggesting a job the school doesn't own (Fail).
  - Case: Suggesting to a non-existent teacher (Fail).
  - Case: Suggesting successfully (Pass).

**🟢 GREEN: Implement to Make Tests Pass**
- [x] **Task 11.2.2**: Implement `suggestJob` in `ApplicationsService`.
- [x] **Task 11.2.3**: Expose `POST /api/applications/jobs/:id/suggest` in Controller.

**🔵 REFACTOR: Clean Up Code**
- [ ] **Task 11.2.4**: Optimize queries.

#### Quality Gate ✋
- [ ] Unit tests pass.

---

### Phase 11.3: Chat System (Backend)
**Goal**: Basic messaging API.
**Estimated Time**: 2 hours
**Status**: ✅ Complete

#### Tasks

**🔴 RED: Write Failing Tests First**
- [ ] **Test 11.3.1**: Unit tests for `ChatService`.
  - Case: Create room (idempotent).
  - Case: Send message (stores correctly).
  - Case: Get messages (returns forbidden for non-members).

**🟢 GREEN: Implement to Make Tests Pass**
- [x] **Task 11.3.2**: Implement `ChatService`.
  - `createRoom`, `sendMessage`, `getMessages`, `getMyRooms`.
- [x] **Task 11.3.3**: Implement `ChatController`.
- [x] **Task 11.3.4**: Integrate Chat creation into `ApplicationsService.updateStatus` (Auto-create on INTERVIEWING).

**🔵 REFACTOR: Clean Up Code**
- [ ] **Task 11.3.5**: Ensure `forbidden` checks are robust.

#### Quality Gate ✋
- [ ] API endpoints verified with tests.

---

### Phase 11.4: Frontend Integration
**Goal**: UI for suggestions and chat.
**Estimated Time**: 3 hours
**Status**: ✅ Complete

#### Tasks

- [x] **Task 11.4.1**: Create `apps/dashboard/messages` UI.
- [x] **Task 11.4.2**: Create `suggest` Modal in `teachers` page.
- [x] **Task 11.4.3**: Update `Sidebar` and `DashboardLayout`.

---

## ⚠️ Risk Assessment

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| **Chat Performance** | Low (MVP) | Medium | Pagination for messages (implemented `take: 1` for preview, need details). |
| **Notification Lag** | High (Polling) | Low | Acceptable for MVP. Plan Socket.io for Phase 12. |

---

## 📝 Notes & Learnings
- Prisma's `include` is powerful for Chat relationships (Include Sender Profile).
- Using `isSuggestion` flag allows reusing the Application table effectively without a separate "Suggestion" table.
