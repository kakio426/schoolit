# Implementation Plan: Teacher Profile Form Input Visibility Fix

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

### Problem Statement
교사 프로필 폼에서 입력창(경력, 학력, 포트폴리오, 자격증)의 배경색은 회색으로 보이지만, placeholder 텍스트와 입력값이 거의 보이지 않는 문제가 발생.

**근본 원인 분석**:
1. 다크 모드에서 회색 배경(`#f1f5f9`)에 어두운 텍스트가 적용되고 있음
2. `text-foreground` 클래스가 다크 모드에서 흰색이 아닌 어두운 색으로 렌더링됨
3. 인라인 스타일이 텍스트 색상을 강제하지 않음
4. placeholder 색상이 배경과 대비가 낮음

### Success Criteria
- [ ] 라이트 모드: 회색 배경 + 진한 회색/검정 텍스트
- [ ] 다크 모드: 어두운 배경 + 밝은 회색/흰색 텍스트
- [ ] Placeholder 텍스트가 명확하게 보임
- [ ] 날짜/드롭다운 입력도 동일한 가시성 확보

### User Impact
교사가 프로필 정보를 입력할 때 모든 입력창에서 텍스트가 명확하게 보이게 됨.

---

## 🏗️ Architecture Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| 인라인 스타일로 텍스트 색상 강제 | Tailwind/CSS 우선순위 문제 완전 우회 | 코드 중복, 유지보수성 감소 |
| 다크 모드 전용 색상 분기 | 다크 모드에서 별도의 색상 체계 필요 | JavaScript로 모드 감지 필요 |
| CSS 변수 사용 | 한 곳에서 관리, 일관성 유지 | 브라우저 호환성 고려 필요 |

---

## 🚀 Implementation Phases

### Phase 1: 텍스트 색상 강제 적용
**Goal**: 모든 입력창에서 텍스트가 명확하게 보이도록 인라인 스타일 수정
**Estimated Time**: 1시간
**Status**: ⏳ Pending

#### Tasks

**🟢 GREEN: 직접 구현**
- [ ] **Task 1.1**: 경력 섹션 입력창 텍스트 색상 수정
  - File: `apps/frontend/src/components/profile/TeacherProfileForm.tsx`
  - 변경: `style={{backgroundColor: '#f1f5f9', border: '2px solid #94a3b8', color: '#1e293b'}}`
  - 다크 모드: `className`에 `dark:!text-white dark:!bg-slate-800` 추가
  - Placeholder: `placeholder:text-slate-500 dark:placeholder:text-slate-400` 추가

- [ ] **Task 1.2**: 학력 섹션 입력창 수정
  - 동일한 패턴 적용: 입력, 드롭다운, 날짜

- [ ] **Task 1.3**: 포트폴리오/링크 섹션 입력창 수정
  - 제목, URL 입력창

- [ ] **Task 1.4**: 자격증 섹션 입력창 수정
  - 명칭, 발급기관, 날짜 입력창

**🔵 REFACTOR: 코드 정리**
- [ ] **Task 1.5**: 공통 스타일 상수 추출
  - 반복되는 스타일을 상수로 정의
  - 예: `const INPUT_STYLE = { backgroundColor: '...', ... }`
  - 유지보수성 향상

#### Quality Gate ✋

**Build & Tests**:
- [ ] `npm run build` 성공 (프론트엔드)
- [ ] 타입 에러 없음

**Manual Testing**:
- [ ] 라이트 모드에서 입력창 텍스트 보임
- [ ] 다크 모드에서 입력창 텍스트 보임
- [ ] Placeholder 텍스트 보임
- [ ] 날짜 선택기 텍스트 보임
- [ ] 드롭다운 선택 텍스트 보임

**Validation Commands**:
```bash
cd apps/frontend
npm run build
```

---

### Phase 2: 기타 프로필 영역 점검 및 일관성 확보
**Goal**: 기본 정보 섹션(자기소개, 계좌, 연락처 등)도 동일한 가시성 확보
**Estimated Time**: 30분
**Status**: ⏳ Pending

#### Tasks

- [ ] **Task 2.1**: 기본 정보 섹션 입력창 점검
  - 자기소개 textarea
  - 정산용 계좌 input
  - 연락처 input
  - 과목/지역 추가 input

- [ ] **Task 2.2**: 스타일 일관성 확인
  - 모든 섹션이 동일한 스타일 패턴 사용 확인

#### Quality Gate ✋

- [ ] 모든 입력창 가시성 확인 (라이트/다크)
- [ ] 빌드 성공

---

## ⚠️ Risk Assessment

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| 다크 모드 감지 실패 | Low | High | Tailwind `dark:` 접두사 의존 |
| 스타일 충돌 | Medium | Medium | 인라인 스타일 우선순위 활용 |
| 브라우저 호환성 | Low | Low | 표준 CSS 속성만 사용 |

---

## 🔄 Rollback Strategy

### If Phase 1 Fails
- Git revert: `git revert HEAD`
- 이전 커밋으로 복구

---

## 📊 Progress Tracking

### Completion Status
- **Phase 1**: ⏳ 0%
- **Phase 2**: ⏳ 0%

**Overall Progress**: 0% complete

---

## 📝 Notes & Learnings

### Core Fix Pattern
```tsx
// 수정 전
<input 
  style={{backgroundColor: '#f1f5f9', border: '2px solid #94a3b8'}} 
  className="..." 
/>

// 수정 후
<input 
  style={{backgroundColor: '#f1f5f9', border: '2px solid #94a3b8', color: '#1e293b'}} 
  className="... dark:!bg-slate-800 dark:!text-white dark:!border-slate-600 placeholder:text-slate-500 dark:placeholder:text-slate-400" 
/>
```

---

**Plan Status**: 🔄 In Progress
**Next Action**: Phase 1 구현 시작
**Blocked By**: 사용자 승인 대기
