# Implementation Plan: Phase 7 (Admin Verification Flow)

**Status**: 🔄 In Progress
**Started**: 2026-01-02
**Last Updated**: 2026-01-02
**Estimated Completion**: 2026-01-03

---

## 📋 Overview

### Feature Description
Admins need to review submitted certifications and approve or reject them. When a certification is approved, the teacher should automatically become "Verified".

### Success Criteria
- [ ] Admin can list all pending certifications.
- [ ] Admin can update a certification's status (APPROVED/REJECTED).
- [ ] Teacher's profile `isVerified` becomes `true` when a certificate is `APPROVED`.
- [ ] Admin routes are protected by role-based guard.

---

## 🚀 Implementation Phases

### Phase 7.1: Role-Based Access Control (RBAC)
- [ ] Create `RolesGuard` to check user roles.
- [ ] Create `@Roles` decorator.

### Phase 7.2: Admin Certification API (TDD)
- [ ] **RED**: Test `PATCH /admin/certifications/:id/status` returns 403 for non-admins.
- [ ] **RED**: Test `PATCH /admin/certifications/:id/status` updates status and verifies teacher.
- [ ] **GREEN**: Implement `AdminController` and `AdminService`.
- [ ] **GREEN**: Add logic to update `TeacherProfile.isVerified`.

### Phase 7.3: Admin UI (Basic)
- [ ] Create an Admin Dashboard page in the frontend.
- [ ] List all certifications and provide Approve/Reject buttons.
