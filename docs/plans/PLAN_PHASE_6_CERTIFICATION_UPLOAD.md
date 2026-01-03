# Implementation Plan: Phase 6 (File Upload & Verification Flow)

**Status**: 🔄 In Progress
**Started**: 2026-01-02
**Last Updated**: 2026-01-02
**Estimated Completion**: 2026-01-05

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
Teachers need to prove their qualifications to gain "Verified" status. This phase implements the infrastructure for uploading certification documents (PDF/Images) and the backend flow to manage these requests.

### Success Criteria
- [ ] Backend can accept and store files (Local Storage for dev).
- [ ] Database stores certification records linked to the teacher.
- [ ] Frontend allows teachers to select, preview, and upload documents.
- [ ] Teachers can see the status of their submitted certifications (Pending/Approved/Rejected).

### User Impact
- **Teachers**: Can gain trust and credibility by submitting real proof of their skills.
- **Schools**: Can search for verified teachers with confidence.

---

## 🏗️ Architecture Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| **Local File Storage** | Simple to implement for initial development without external costs (S3, etc.). | Not scalable for production; requires migration to Cloud Storage later. |
| **Prisma Certification Model** | Relational approach allows tracking history and multiple certificates per teacher. | Slightly more complex than a simple URL array in `TeacherProfile`. |
| **Multer (NestJS)** | Standard node.js middleware for handling `multipart/form-data`. | Requires specific configuration for file limits and filters. |

---

## 📦 Dependencies

### Required Before Starting
- [x] Phase 5 (Teacher Profile Foundation) completed.
- [x] Backend running with PostgreSQL.

### External Dependencies
- `multer`: Included in NestJS for file uploads.
- `@types/multer`: For TypeScript support.

---

## 🧪 Test Strategy

### Testing Approach
**TDD Principle**: Write tests for file upload endpoints and status transitions before implementation.

### Test Pyramid for This Feature
| Test Type | Coverage Target | Purpose |
|-----------|-----------------|---------|
| **Unit Tests** | ≥80% | Service logic for file metadata storage and status management. |
| **Integration Tests** | Critical paths | Multer config validation (file type/size), API endpoint handling. |
| **E2E Tests** | Key user flows | Full flow: Select file -> Upload -> Verify record in DB. |

---

## 🚀 Implementation Phases

### Phase 6.1: Backend Upload Foundation
**Goal**: Configure NestJS to handle file uploads and serve static files.
**Status**: ✅ Complete

#### Tasks
**🔴 RED: Write Failing Tests First**
- [x] **Test 6.1.1**: E2E test for `POST /users/certifications/upload` expecting 401 if unauthorized.
- [x] **Test 6.1.2**: E2E test expecting 400 if invalid file type (e.g., .txt) is uploaded.

**🟢 GREEN: Implement to Make Tests Pass**
- [x] **Task 6.1.3**: Configure `MulterModule` and create `uploads/` directory.
- [x] **Task 6.1.4**: Setup `ServeStaticModule` to allow viewing uploaded files in dev.
- [x] **Task 6.1.5**: Implement basic upload controller with file filter logic.

**🔵 REFACTOR: Clean Up Code**
- [x] **Task 6.1.6**: Refactor file naming logic to use date-based suffixes to avoid collisions (Reverted UUID due to E2E crash issues, but achieved goal).

#### Quality Gate ✋
- [x] **Security**: Files are saved with non-executable names.
- [x] **Validation**: Max file size (5MB) enforced.

---

### Phase 6.2: Certification Entity & API (TDD)
**Goal**: Link files to the database and manage verification status.
**Status**: ✅ Complete

#### Tasks
**🔴 RED: Write Failing Tests First**
- [x] **Test 6.2.1**: Test that creating a certification record defaults status to `PENDING`.
- [x] **Test 6.2.2**: Test that `isVerified` in `TeacherProfile` remains `false` until admin approves.

**🟢 GREEN: Implement to Make Tests Pass**
- [x] **Task 6.2.3**: Update `schema.prisma` with `Certification` model and run migration.
- [x] **Task 6.2.4**: Create `CertificationService` to handle DB records.
- [x] **Task 6.2.5**: Implement `GET /users/certifications` to list teacher's submissions.

**🔵 REFACTOR: Clean Up Code**
- [x] **Task 6.2.6**: Add metadata (upload date, original filename) to the DB record.

#### Quality Gate ✋
- [x] **DB**: Foreign key relations are correct.
- [x] **Atomic**: DB record is only created if file upload is successful.

---

### Phase 6.3: Frontend Upload UI
**Goal**: User-friendly UI for managing certificates.
**Status**: ✅ Complete

#### Tasks
**🔴 RED: Write Failing Tests First**
- [x] **Test 6.3.1**: Verify "Upload" button is disabled if no file is selected.
- [x] **Test 6.3.2**: Check if "Pending" badge appears next to uploaded certificates.

**🟢 GREEN: Implement to Make Tests Pass**
- [x] **Task 6.3.3**: Create `FileUpload` component with drag-and-drop support (Basic select implemented).
- [x] **Task 6.3.4**: Implement `CertificationList` component in the profile page.
- [x] **Task 6.3.5**: Connect UI to backend API.

#### Quality Gate ✋
- [x] **UX**: Show progress bar or loading spinner during upload (Loading button state).
- [x] **Mobile**: File selection works seamlessly on mobile devices.

---

## ⚠️ Risk Assessment

| Risk | Probability | Impact | Mitigation Strategy |
|----------|-----------|------------|---------------------|
| Storage leak | Medium | Medium | Implement cleanup logic for orphaned files later. |
| Malicious file upload | Medium | High | Strict MIME type checking and non-executable storage. |

---

## 🔄 Rollback Strategy
### If Phase 6.1 Fails
- Delete `uploads/` directory and revert `Multer` config changes.
### If Phase 6.2 Fails
- Revert Prisma migration and rollback `schema.prisma`.

---

## ✅ Final Checklist
- [x] Teachers can upload multiple certifications.
- [x] Admin (Manual for now) can see the uploaded files via URL.
- [x] Frontend displays status correctly.
