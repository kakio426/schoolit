# PLAN: RAG OOM (Out of Memory) Fix

> **Last Updated**: 2026-01-17
> **Status**: Planning Phase (User Approval Required)
> **Scope**: Medium (4-5 phases, 8-15 hours total)

---

**CRITICAL INSTRUCTIONS**: After completing each phase:
1. ✅ Check off completed task checkboxes
2. 🧪 Run all quality gate validation commands
3. ⚠️ Verify ALL quality gate items pass
4. 📅 Update "Last Updated" date
5. 📝 Document learnings in Notes section
6. ➡️ Only then proceed to next phase

⛔ DO NOT skip quality gates or proceed with failing checks

---

## Overview & Objectives

**Problem Statement**:
Railway 배포 환경에서 대용량 PDF(약 166KB, 165,976자) 처리 시 `JavaScript heap out of memory` 에러 발생으로 서버 크래시.

**Root Cause Analysis**:
1. `pdf-parse` 2.4.5 라이브러리가 내부적으로 `pdfjs-dist`를 사용하며, 이 과정에서 PDF 전체를 메모리에 로드
2. 추출된 텍스트(~166KB) + 청크 배열 + 임베딩 벡터(768차원 × N개)가 힙에 누적
3. Railway Free Tier 메모리 제한(~512MB)과 Node.js 기본 힙 제한(~1.5GB) 충돌
4. 현재 구현된 배치 처리(5개씩)만으로는 pdf-parse 자체의 메모리 사용을 해결하지 못함

**Solution Objectives**:
1. Railway 환경에서 안정적으로 20MB 이하의 PDF 처리 가능
2. 메모리 제한 초과 시 서버 크래시 대신 사용자 친화적인 에러 반환
3. TDD 기반으로 모든 변경 검증

---

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| 파일 크기 제한 강화 (20MB → 10MB) | 대용량 파일의 근본적 차단 |
| 스트리밍 대신 청크 사이즈 축소 | pdf-parse가 스트리밍 미지원, 대안으로 청크 단위 최소화 |
| Node.js 힙 메모리 증가 옵션 제안 | Railway 환경 변수로 `NODE_OPTIONS=--max-old-space-size=1024` 설정 |
| 에러 핸들링 강화 | OOM 발생 전에 예방적 검사 추가 |

---

## Phase Breakdown

### Phase 1: Requirements & Environment Analysis (1시간)
| Item | Detail |
|------|--------|
| **Goal** | Railway 환경의 정확한 메모리 제한 파악 및 현재 상태 진단 |
| **Tasks** | 1. Railway 대시보드에서 메모리 사용량 확인 요청<br>2. 현재 pdf-parse 메모리 사용 패턴 분석<br>3. 성공/실패 임계점 문서 크기 산출 |
| **Quality Gate** | 분석 결과 문서화 및 부장님 확인 |
| **Dependencies** | Railway 대시보드 접근 필요 |
| **Rollback** | N/A (분석 단계) |

---

### Phase 2: TDD - Red Phase (1.5시간)
| Item | Detail |
|------|--------|
| **Goal** | 실패하는 테스트 케이스 작성으로 문제 재현 |
| **Test File** | `apps/backend/src/rag/rag-oom.spec.ts` |
| **Test Scenarios** | 1. 10MB 초과 파일 업로드 시 에러 반환 테스트<br>2. 정상 크기 파일(5MB) 처리 성공 테스트<br>3. 메모리 사용량 모니터링 테스트 (process.memoryUsage) |
| **Expected Failures** | 현재 코드로 테스트 시 10MB 제한 미적용(20MB 허용)으로 첫 번째 테스트 실패 |
| **Quality Gate** | 테스트가 의도된 이유로 실패 |
| **Dependencies** | Phase 1 완료 |
| **Rollback** | 테스트 파일 삭제 |

---

### Phase 3: TDD - Green Phase (2시간)
| Item | Detail |
|------|--------|
| **Goal** | 테스트를 통과시키는 최소 코드 구현 |
| **Changes** | |

#### [MODIFY] rag.service.ts
- `MAX_FILE_SIZE_MB`를 20 → 10으로 축소
- 처리 전 예상 메모리 사용량 계산 로직 추가
- try-catch로 OOM 방어 및 친절한 에러 메시지 반환

#### [NEW] rag-oom.spec.ts
- 위 테스트 통과 확인

| **Quality Gate** | 모든 테스트 PASS, 빌드 성공 |
| **Dependencies** | Phase 2 완료 |
| **Rollback** | `git revert` |

---

### Phase 4: Quality Gates & Deployment (1시간)
| Item | Detail |
|------|--------|
| **Goal** | 프로덕션 안정성 확보 및 배포 |
| **Tasks** | 1. `npm run build` 성공<br>2. `npm run test` 전체 통과<br>3. Railway 환경 변수 `NODE_OPTIONS` 설정 확인 요청<br>4. Git Push 및 Railway 배포 |
| **Quality Gate** | 실서버에서 5MB PDF 업로드 성공 |
| **Dependencies** | Phase 3 완료 |
| **Rollback** | Railway 이전 버전 롤백 |

---

### Phase 5: Verification & Documentation (30분)
| Item | Detail |
|------|--------|
| **Goal** | 최종 검증 및 문서화 |
| **Tasks** | 1. 실서버에서 다양한 크기 PDF 테스트(1MB, 5MB, 10MB)<br>2. 워크스루 문서 업데이트<br>3. 부장님께 최종 보고 |
| **Quality Gate** | 모든 테스트 케이스 성공, 워크스루 완료 |
| **Dependencies** | Phase 4 완료 |
| **Rollback** | N/A (문서화 단계) |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| 10MB 제한으로도 OOM 발생 | Medium | High | 5MB로 추가 축소 또는 Railway 플랜 업그레이드 권장 |
| pdf-parse 자체 버그 | Low | High | 라이브러리 버전 다운그레이드(1.1.x) 검토 |
| Railway 환경 변수 미적용 | Medium | Medium | 배포 후 로그에서 `--max-old-space-size` 확인 |

---

## Rollback Strategy (전체)

1. **즉시 롤백**: `git revert HEAD~N` 명령으로 해당 커밋 취소
2. **Railway 롤백**: 대시보드에서 이전 배포 버전 선택
3. **임시 조치**: `MAX_FILE_SIZE_MB`를 5MB로 급히 축소하여 재배포

---

## Notes & Learnings

(작업 진행 중 기록할 내용)

---

## Progress Tracking

- [ ] Phase 1: Requirements & Environment Analysis
- [ ] Phase 2: TDD - Red Phase
- [ ] Phase 3: TDD - Green Phase
- [ ] Phase 4: Quality Gates & Deployment
- [ ] Phase 5: Verification & Documentation

---

**부장님, 위 계획서를 검토해 주시고 진행 승인 부탁드립니다.**
