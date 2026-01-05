# Implementation Plan: Risk Management & Strategic Pivot

**Status**: ✅ Done
**Priority**: Critical (Legal/Strategic)

---

## 📋 Overview

### Goal
Realign the platform's technical implementation with the "Risk Minimization & Innovation Prototype" strategy.
We will remove features that create liability (certificate storage) and add features that emphasize the platform's role as a *connection facilitator* rather than a *verification authorty*.

### Objectives
1.  **Risk Removal**: Delete "Certificate Upload" features (DB, API, UI).
2.  **Liability Shield**: Implement strict disclaimer modals and footer notices.
3.  **Privacy First**: Shift verification responsibility to offline/direct channels (School Admin ↔ Teacher).

---

## 🏗️ Strategic Changes (The "Safe" Architecture)

| Component | Current State | New State | Why? |
|-----------|---------------|-----------|------|
| **Certifications** | Upload PDF/Image to Server | **Checklist / Self-Declaration** | Avoiding direct storage of sensitive docs reduces liability and CSAP/PIPA risks. |
| **Verification** | Platform verifies docs (implied) | **School verifies offline** | Platform disclaims responsibility; School follows standard hiring protocols. |
| **Data Storage** | Permanent storage of docs | **No document storage** | Minimizes damage in case of breach/audit. |

---

## 🚀 Implementation Phases

### Phase 1: Feature Removal (De-Risking)
**Goal**: Remove code related to certificate file uploads.

#### Tasks
- [x] **Schema Cleanup**: Remove `Certification` model and `certifications` relation from `TeacherProfile`.
- [x] **API Removal**: Delete `/users/certifications/*` endpoints and `CertificationService`.
- [x] **Frontend Removal**: Remove `FileUpload` component usage in `ProfilePage` / `TeacherProfileForm`.
    - Replace with a simple "Certificate List" (text-only input: "Which certs do you have?").

### Phase 2: Disclaimer & Safety UI
**Goal**: Add visible legal shields.

#### Tasks
- [x] **Profile Disclaimer**: Add a prominent alert on Profile Pages:
    > " 본 프로필의 정보는 작성자가 제공한 것으로, 에듀핀은 그 진위 여부를 보증하지 않습니다. 채용 시 반드시 원본 서류 대조가 필요합니다."
- [x] **Footer Notice**: Add "Research Prototype" disclaimer to the footer.
    > "본 서비스는 교육 정보화 연구를 위한 베타 서비스로, 영리 목적이 없으며 매칭에 대한 법적 책임을 지지 않습니다."

### Phase 3: "Self-Verification" Logic replacement
**Goal**: Replace "Uploaded File" with "Verified by School" logic placeholder.

#### Tasks
- [x] **Update Teacher Profile**: Add `licenseNumbers` (optional string field) instead of files, or just `licenses` (string array).
- [x] **UI Update**: Change "Upload Cert" button to "Add License Info" (Text input: License Name, Issuer, Date).

---

## ⚠️ Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| **User Trust Drop** | Medium | Users might think "No verification = Low quality". **Countermeasure**: Frame it as "Direct School Verification" (faster/safer). |
| **Migration Data Loss** | Low | We are in dev stage; deleting `Certification` table is acceptable. |

---

## ✅ Final Checklist
- [x] No file upload buttons for certificates exist.
- [x] Disclaimer is visible on every profile view.
- [x] `schema.prisma` is clean of `Certification` model.
