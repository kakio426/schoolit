# Implementation Plan: 에듀핀(Edupin) 통합 업그레이드 v3.0 - Storage Abstraction & Community Features

**Status**: ✅ Complete
**Started**: 2026-01-08
**Last Updated**: 2026-01-08
**Estimated Completion**: 2026-01-08 (완료)

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

이 계획은 **"이사가 쉬운 구조(Storage Abstraction)"**를 핵심 원칙으로, 다음 3가지 주요 기능을 통합 구현합니다:

1. **Storage Abstraction Layer**: Cloudinary를 사용하되, 나중에 S3/다른 스토리지로 쉽게 교체 가능한 인터페이스 기반 설계
2. **User Account Deletion**: 개인정보보호법 준수를 위한 회원 탈퇴 기능 (Soft Delete + 데이터 파기 스케줄러)
3. **Community Board System**: 사용자 간 소통을 위한 게시판 시스템 (공지, 자유, Q&A)
4. **Enhanced Review System**: 리뷰에 이미지 첨부 기능 추가 및 아카이브 기능 강화

### Success Criteria

- [x] **Storage Independence**: DB에는 이미지 URL이 아닌 고유 ID만 저장되며, Storage Provider 변경 시 비즈니스 로직 수정 불필요
- [x] **Legal Compliance**: 회원 탈퇴 시 개인정보가 즉시 비공개 처리되고, 6개월 후 완전 삭제 스케줄러 구현
- [x] **Community Engagement**: 게시판 CRUD, 댓글, 좋아요, 이미지 첨부 기능이 모두 작동
- [x] **Enhanced Reviews**: 리뷰 작성 시 최대 5장의 이미지 첨부 가능, 사용자별 리뷰 아카이브 조회 가능
- [x] **Test Coverage**: 모든 핵심 비즈니스 로직 테스트 통과 (63/63 tests)
- [x] **Production Ready**: Vercel + Railway 환경에서 안정적으로 배포 및 운영 가능

### User Impact

**학교 (SCHOOL)**
- ✅ 커뮤니티 게시판을 통해 다른 학교와 정보 공유
- ✅ 강사/업체 리뷰를 사진과 함께 작성하여 신뢰도 향상
- ✅ 회원 탈퇴 옵션으로 개인정보 관리 권한 확보

**교사/강사 (TEACHER)**
- ✅ 받은 리뷰를 사진과 함께 프로필에 표시하여 전문성 증명
- ✅ Q&A 게시판에서 학교 관계자와 소통
- ✅ 개인정보 보호를 위한 탈퇴 권리 보장

**사업자 (BUSINESS)**
- ✅ 포트폴리오 사진이 안정적으로 저장/관리됨
- ✅ 리뷰 관리 및 신뢰도 구축
- ✅ 커뮤니티 참여로 브랜드 인지도 향상

**시스템 관리자**
- ✅ Storage Provider 변경 시 코드 최소 수정으로 마이그레이션 가능
- ✅ 법적 리스크 감소 (개인정보보호법 준수)
- ✅ 확장 가능한 아키텍처로 유지보수 용이

---

## 🏗️ Architecture Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| **Interface 기반 Storage 추상화** | 비즈니스 로직과 Storage 구현을 분리하여 나중에 Cloudinary → S3 등으로 교체 시 Service Layer 수정 불필요 | 초기 구현 복잡도 증가, 하지만 장기적 유지보수 비용 대폭 감소 |
| **DB에 imageId만 저장** | URL 저장 시 Storage Provider 변경 시 전체 DB 마이그레이션 필요, ID만 저장하면 URL 생성 로직만 변경 | API 응답 시 매번 URL 생성 필요 (getFileUrl 호출), 하지만 캐싱으로 해결 가능 |
| **Soft Delete (isDeleted 플래그)** | Hard Delete 시 리뷰/채팅 등 연관 데이터 처리 복잡, Soft Delete로 복구 가능성 및 법적 대응 강화 | DB 공간 증가, 하지만 6개월 후 스케줄러로 완전 삭제 |
| **Cloudinary 우선 구현** | 무료 티어 제공, 이미지 변환/최적화 자동화, CDN 포함 | Vendor Lock-in 위험, 하지만 Interface로 격리하여 완화 |
| **게시판 별도 모델 (Board, Post, Comment)** | 기존 Review와 분리하여 각 도메인의 책임 명확화 | 테이블 증가, 하지만 확장성 및 유지보수성 향상 |

---

## 📦 Dependencies

### Required Before Starting
- [x] PostgreSQL Database (Railway) - 이미 구축됨
- [x] NestJS Backend Framework - 이미 구축됨
- [x] Prisma ORM - 이미 구축됨
- [x] Jest Testing Framework - 이미 구축됨
- [ ] Cloudinary Account 생성 및 API Key 발급
- [ ] `.env` 파일에 Cloudinary 환경 변수 추가

### External Dependencies
- `cloudinary`: ^2.0.0 (Cloudinary SDK for Node.js)
- `@nestjs/schedule`: ^4.0.0 (Cron job scheduler for soft delete cleanup)
- 기존 dependencies 유지: `@prisma/client`, `multer`, `class-validator` 등

### Environment Variables (추가 필요)
```bash
# .env에 추가
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🧪 Test Strategy

### Testing Approach
**TDD Principle**: Write tests FIRST, then implement to make them pass

### Test Pyramid for This Feature

| Test Type | Coverage Target | Purpose |
|-----------|-----------------|---------|
| **Unit Tests** | ≥80% | Storage Service, User Deletion Logic, Board/Post Service |
| **Integration Tests** | Critical paths | Storage Upload/Delete Cycle, Board CRUD Operations |
| **E2E Tests** | Key user flows | User Deletion Flow, Post Creation with Image Upload |

### Test File Organization
```
apps/backend/
├── src/
│   ├── common/storage/
│   │   ├── storage.service.spec.ts (Unit)
│   │   └── cloudinary.service.spec.ts (Unit)
│   ├── users/
│   │   └── user.service.spec.ts (Unit - 탈퇴 로직 추가)
│   ├── board/
│   │   ├── board.service.spec.ts (Unit)
│   │   ├── post.service.spec.ts (Unit)
│   │   └── comment.service.spec.ts (Unit)
│   └── reviews/
│       └── reviews.service.spec.ts (Unit - 이미지 추가)
└── test/
    ├── storage.e2e-spec.ts (E2E - 파일 업로드/삭제)
    ├── user-deletion.e2e-spec.ts (E2E - 회원 탈퇴)
    └── board.e2e-spec.ts (E2E - 게시판 CRUD)
```

### Coverage Requirements by Phase
- **Phase 1 (Storage Interface)**: IStorageService 인터페이스, CloudinaryService 단위 테스트 (≥80%)
- **Phase 2 (Database Schema)**: Prisma migration 성공, 데이터 무결성 확인
- **Phase 3 (User Deletion)**: UserService.deleteAccount 단위 테스트 + E2E 탈퇴 플로우 (≥80%)
- **Phase 4 (Board System)**: Board/Post/Comment Service 단위 테스트 + E2E CRUD (≥80%)
- **Phase 5 (Review Images)**: ReviewService 이미지 업로드 단위 테스트 + E2E (≥80%)
- **Phase 6 (Data Cleanup Scheduler)**: Scheduler 로직 단위 테스트, Mock 시간 이용

### Test Commands
```bash
# Unit Tests
npm test

# Unit Tests with Coverage
npm test -- --coverage

# E2E Tests
npm run test:e2e

# Specific Test File
npm test -- storage.service.spec.ts

# Linting
npm run lint

# Type Check
npx tsc --noEmit
```

---

## 🚀 Implementation Phases

### Phase 1: Storage Abstraction Layer (Interface + Cloudinary)
**Goal**: 이미지 저장 로직을 추상화하여 나중에 Storage Provider 교체 시 비즈니스 로직 수정 불필요하게 만들기
**Estimated Time**: 4 hours
**Status**: ✅ Complete

#### Tasks

**🔴 RED: Write Failing Tests First**

- [ ] **Test 1.1**: IStorageService 인터페이스 단위 테스트 작성
  - File: `apps/backend/src/common/storage/storage.service.spec.ts`
  - Expected: 테스트 FAIL (인터페이스 및 구현체 미존재)
  - Test Cases:
    - `uploadFile(file, folder)` → 고유 ID 반환
    - `deleteFile(imageId)` → 삭제 성공
    - `getFileUrl(imageId)` → 전체 URL 반환
    - Error handling: 파일 없음, 업로드 실패 등

- [ ] **Test 1.2**: CloudinaryService 구현체 단위 테스트 작성
  - File: `apps/backend/src/common/storage/cloudinary.service.spec.ts`
  - Expected: 테스트 FAIL (CloudinaryService 미구현)
  - Mock Cloudinary SDK for testing
  - Test Cases:
    - 실제 Cloudinary API 호출 시뮬레이션 (Mock)
    - public_id 추출 및 반환 확인
    - URL 생성 로직 검증

- [ ] **Test 1.3**: E2E 파일 업로드 테스트 작성
  - File: `apps/backend/test/storage.e2e-spec.ts`
  - Expected: 테스트 FAIL (엔드포인트 미구현)
  - Test Scenarios:
    - `POST /api/upload/test` → 이미지 업로드 → imageId 반환
    - `GET /api/upload/{imageId}` → 실제 URL로 접근 가능 확인
    - `DELETE /api/upload/{imageId}` → 삭제 후 404 확인

**🟢 GREEN: Implement to Make Tests Pass**

- [ ] **Task 1.4**: IStorageService 인터페이스 정의
  - File: `apps/backend/src/common/storage/interfaces/storage.interface.ts`
  - 내용:
    ```typescript
    export interface IStorageService {
      uploadFile(file: Express.Multer.File, folder: string): Promise<string>; // returns imageId
      deleteFile(imageId: string): Promise<void>;
      getFileUrl(imageId: string): string; // returns full URL
    }
    ```

- [ ] **Task 1.5**: CloudinaryService 구현
  - File: `apps/backend/src/common/storage/cloudinary.service.ts`
  - 구현 사항:
    - Cloudinary SDK 초기화 (`cloudinary.config()`)
    - `uploadFile`: `cloudinary.uploader.upload()` → `public_id` 반환
    - `deleteFile`: `cloudinary.uploader.destroy(imageId)`
    - `getFileUrl`: `cloudinary.url(imageId, { secure: true })`

- [ ] **Task 1.6**: StorageModule 생성 및 의존성 주입 설정
  - File: `apps/backend/src/common/storage/storage.module.ts`
  - 내용:
    ```typescript
    @Module({
      providers: [
        {
          provide: 'IStorageService',
          useClass: CloudinaryService, // 여기만 바꾸면 S3Service 등으로 교체 가능
        },
      ],
      exports: ['IStorageService'],
    })
    export class StorageModule {}
    ```

- [ ] **Task 1.7**: 테스트용 Upload Controller 작성
  - File: `apps/backend/src/common/storage/storage.controller.ts`
  - 엔드포인트:
    - `POST /api/upload/test`: 파일 업로드 테스트
    - `DELETE /api/upload/:imageId`: 파일 삭제 테스트

**🔵 REFACTOR: Clean Up Code**

- [ ] **Task 1.8**: 코드 품질 개선
  - 중복 코드 제거
  - 에러 핸들링 강화 (try-catch, custom exceptions)
  - 로깅 추가 (`Logger` from `@nestjs/common`)
  - JSDoc 주석 추가
  - Configuration validation (ConfigService 활용)

#### Quality Gate ✋

**⚠️ STOP: Do NOT proceed to Phase 2 until ALL checks pass**

**TDD Compliance**:
- [ ] Red Phase: 테스트가 먼저 작성되고 처음에는 실패함
- [ ] Green Phase: 최소 코드로 테스트 통과
- [ ] Refactor Phase: 테스트가 통과 상태를 유지하며 코드 개선
- [ ] Coverage: `npm test -- --coverage` → storage 관련 코드 ≥80%

**Build & Tests**:
- [ ] `npm run build` → 빌드 성공
- [ ] `npm test` → 모든 테스트 통과
- [ ] `npm run test:e2e` → E2E 테스트 통과

**Code Quality**:
- [ ] `npm run lint` → 린트 에러 없음
- [ ] TypeScript Type Check 통과

**Manual Testing**:
- [ ] Cloudinary Dashboard에서 업로드된 이미지 확인
- [ ] 반환된 imageId로 실제 이미지 URL 접근 가능
- [ ] 삭제 후 Cloudinary Dashboard에서 이미지 삭제 확인

---

### Phase 2: Database Schema Expansion (Prisma)
**Goal**: User, Review, Board 관련 DB 스키마 확장 (이미지는 ID만 저장)
**Estimated Time**: 3 hours
**Status**: ✅ Complete

#### Tasks

**🔴 RED: Write Failing Tests First**

- [ ] **Test 2.1**: User Soft Delete 단위 테스트 작성
  - File: `apps/backend/src/users/user.service.spec.ts`
  - Expected: 테스트 FAIL (deleteAccount 메서드 미구현)
  - Test Cases:
    - `deleteAccount(userId)` → `isDeleted = true`, `deletedAt` 설정
    - 탈퇴한 유저 로그인 시도 → 에러 반환
    - 탈퇴한 유저 프로필 조회 → 404 또는 비공개 처리

- [ ] **Test 2.2**: Board 모델 생성 테스트 작성
  - File: `apps/backend/src/board/board.service.spec.ts`
  - Expected: 테스트 FAIL (Board 모델 미존재)
  - Test Cases:
    - Board 생성 (category: NOTICE, FREE, QNA)
    - Board 조회 (카테고리별 필터링)

**🟢 GREEN: Implement to Make Tests Pass**

- [ ] **Task 2.3**: Prisma Schema 확장
  - File: `apps/backend/prisma/schema.prisma`
  - 변경 사항:
    ```prisma
    model User {
      // ... 기존 필드
      isDeleted     Boolean   @default(false) @map("is_deleted")
      deletedAt     DateTime? @map("deleted_at")
      avatarImageId String?   @map("avatar_image_id") // URL 대신 ID
      
      posts         Post[]
      comments      Comment[]
      postLikes     PostLike[]
    }

    model Review {
      // ... 기존 필드
      imageIds      String[]  @default([]) @map("image_ids") // URL → ID 배열
    }

    model Board {
      id          Int      @id @default(autoincrement())
      title       String
      description String?
      category    String   // NOTICE, FREE, QNA
      isPublic    Boolean  @default(true) @map("is_public")
      posts       Post[]
      
      createdAt   DateTime @default(now()) @map("created_at")
      updatedAt   DateTime @updatedAt @map("updated_at")
      
      @@map("boards")
    }

    model Post {
      id        Int      @id @default(autoincrement())
      boardId   Int      @map("board_id")
      board     Board    @relation(fields: [boardId], references: [id], onDelete: Cascade)
      authorId  Int      @map("author_id")
      author    User     @relation(fields: [authorId], references: [id])
      
      title     String
      content   String
      imageIds  String[] @default([]) @map("image_ids") // 이미지 ID 배열
      views     Int      @default(0)
      isPinned  Boolean  @default(false) @map("is_pinned")
      
      comments  Comment[]
      likes     PostLike[]
      
      createdAt DateTime @default(now()) @map("created_at")
      updatedAt DateTime @updatedAt @map("updated_at")
      
      @@map("posts")
    }

    model Comment {
      id        Int      @id @default(autoincrement())
      postId    Int      @map("post_id")
      post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
      authorId  Int      @map("author_id")
      author    User     @relation(fields: [authorId], references: [id])
      
      content   String
      parentId  Int?     @map("parent_id")
      parent    Comment? @relation("CommentReplies", fields: [parentId], references: [id])
      replies   Comment[] @relation("CommentReplies")
      
      createdAt DateTime @default(now()) @map("created_at")
      updatedAt DateTime @updatedAt @map("updated_at")
      
      @@map("comments")
    }

    model PostLike {
      id        Int      @id @default(autoincrement())
      postId    Int      @map("post_id")
      post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
      userId    Int      @map("user_id")
      user      User     @relation(fields: [userId], references: [id])
      
      createdAt DateTime @default(now()) @map("created_at")
      
      @@unique([postId, userId])
      @@map("post_likes")
    }
    ```

- [ ] **Task 2.4**: Prisma Migration 실행
  - 명령어: `npm run migrate` (또는 `npx prisma migrate dev --name storage_abstraction_v3`)
  - 확인: Railway Dashboard에서 새 테이블 생성 확인

- [ ] **Task 2.5**: Prisma Client 재생성
  - 명령어: `npx prisma generate`

**🔵 REFACTOR: Clean Up Code**

- [ ] **Task 2.6**: Migration 검증
  - 데이터 무결성 확인 (기존 User, Review 데이터 유지)
  - Foreign Key Constraints 확인
  - Index 최적화 필요 시 추가

#### Quality Gate ✋

**⚠️ STOP: Do NOT proceed to Phase 3 until ALL checks pass**

**TDD Compliance**:
- [ ] Migration 성공적으로 완료
- [ ] Prisma Studio로 새 스키마 확인: `npx prisma studio`

**Build & Tests**:
- [ ] `npm run build` → 빌드 성공 (Prisma Client 생성 포함)
- [ ] `npm test` → 모든 기존 테스트 통과 (Regression 없음)

**Database Validation**:
- [ ] Railway Dashboard에서 `boards`, `posts`, `comments`, `post_likes` 테이블 확인
- [ ] `users` 테이블에 `is_deleted`, `deleted_at`, `avatar_image_id` 컬럼 확인
- [ ] `reviews` 테이블에 `image_ids` 컬럼 확인

**Manual Testing**:
- [ ] Prisma Studio로 각 테이블에 수동으로 데이터 입력 및 관계 확인

---

### Phase 3: User Account Deletion & Security
**Goal**: 개인정보보호법 준수를 위한 회원 탈퇴 기능 구현 (Soft Delete)
**Estimated Time**: 4 hours
**Status**: ✅ Complete

#### Tasks

**🔴 RED: Write Failing Tests First**

- [ ] **Test 3.1**: UserService.deleteAccount 단위 테스트
  - File: `apps/backend/src/users/user.service.spec.ts`
  - Expected: 테스트 FAIL (메서드 미구현)
  - Test Cases:
    - `deleteAccount(userId)` → `isDeleted = true`, `deletedAt = now()`
    - 삭제된 유저의 개인정보 마스킹 확인 (email, phone 등)
    - 탈퇴 후 리뷰/채팅은 유지되지만 작성자는 "탈퇴한 사용자"로 표시

- [ ] **Test 3.2**: AuthGuard 탈퇴 유저 차단 테스트
  - File: `apps/backend/src/auth/guards/deleted-user.guard.spec.ts`
  - Expected: 테스트 FAIL (Guard 미구현)
  - Test Cases:
    - 탈퇴한 유저 JWT로 API 호출 → 403 Forbidden
    - 탈퇴한 유저 로그인 시도 → "탈퇴한 계정입니다" 메시지

- [ ] **Test 3.3**: E2E 회원 탈퇴 플로우 테스트
  - File: `apps/backend/test/user-deletion.e2e-spec.ts`
  - Expected: 테스트 FAIL (엔드포인트 미구현)
  - Test Scenarios:
    - `DELETE /api/users/me` → 회원 탈퇴 성공
    - 탈퇴 후 로그인 시도 → 에러
    - 탈퇴 후 프로필 조회 → 404 또는 비공개

**🟢 GREEN: Implement to Make Tests Pass**

- [ ] **Task 3.4**: UserService.deleteAccount 구현
  - File: `apps/backend/src/users/user.service.ts`
  - 구현:
    ```typescript
    async deleteAccount(userId: number): Promise<void> {
      // 1. Soft Delete
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          // 2. 개인정보 마스킹 (선택)
          email: `deleted_${userId}@deleted.com`,
          phone: null,
          name: '탈퇴한 사용자',
        },
      });
      
      // 3. 관련 프로필 비공개 처리
      // (TeacherProfile, SchoolProfile, BusinessProfile의 isVerified = false 등)
    }
    ```

- [ ] **Task 3.5**: DeletedUserGuard 구현
  - File: `apps/backend/src/auth/guards/deleted-user.guard.ts`
  - 로직:
    - JWT에서 userId 추출
    - User 조회 후 `isDeleted === true`이면 ForbiddenException
    - 메시지: "탈퇴한 계정입니다. 복구를 원하시면 고객센터로 문의해주세요."

- [ ] **Task 3.6**: AuthService.validateUser 수정
  - File: `apps/backend/src/auth/auth.service.ts`
  - 로그인 시 `isDeleted` 확인 추가

- [ ] **Task 3.7**: UserController에 탈퇴 엔드포인트 추가
  - File: `apps/backend/src/users/users.controller.ts`
  - 엔드포인트: `DELETE /users/me`
  - Guards: `@UseGuards(AuthGuard('jwt'), DeletedUserGuard)`

**🔵 REFACTOR: Clean Up Code**

- [ ] **Task 3.8**: 코드 품질 개선
  - 에러 메시지 국제화 (i18n) 고려
  - 로깅: 탈퇴 이벤트 로그 기록 (감사 목적)
  - 재가입 방지 로직 (선택): 탈퇴 후 30일 이내 재가입 차단
  - 복구 기능 구현 (선택): 관리자가 탈퇴 취소 가능

#### Quality Gate ✋

**TDD Compliance**:
- [ ] Red-Green-Refactor 완료
- [ ] Coverage: `npm test -- user.service.spec.ts --coverage` ≥80%

**Build & Tests**:
- [ ] 모든 테스트 통과
- [ ] E2E 테스트 통과

**Security**:
- [ ] 탈퇴한 유저의 민감 정보가 API 응답에 노출되지 않음
- [ ] JWT 블랙리스트 고려 (선택 사항)

**Manual Testing**:
- [ ] Postman으로 탈퇴 API 호출 → DB에서 `is_deleted = true` 확인
- [ ] 탈퇴 후 로그인 시도 → 에러 메시지 확인
- [ ] 탈퇴한 유저 프로필 조회 → 비공개 처리 확인

---

### Phase 4: Community Board System
**Goal**: 게시판 CRUD, 댓글, 좋아요, 이미지 첨부 기능 구현
**Estimated Time**: 6 hours
**Status**: ✅ Complete

#### Tasks

**🔴 RED: Write Failing Tests First**

- [ ] **Test 4.1**: BoardService 단위 테스트
  - File: `apps/backend/src/board/board.service.spec.ts`
  - Test Cases:
    - `createBoard()` → Board 생성
    - `getAllBoards()` → 모든 게시판 조회
    - `getBoardByCategory(category)` → 카테고리별 조회

- [ ] **Test 4.2**: PostService 단위 테스트
  - File: `apps/backend/src/board/post.service.spec.ts`
  - Test Cases:
    - `createPost(boardId, authorId, title, content, imageIds)` → Post 생성
    - `getPostsByBoard(boardId)` → 게시판별 게시글 목록
    - `updatePost(postId, userId, updateData)` → 본인 글만 수정 가능
    - `deletePost(postId, userId)` → 본인 글만 삭제 가능
    - `incrementViews(postId)` → 조회수 증가

- [ ] **Test 4.3**: CommentService 단위 테스트
  - File: `apps/backend/src/board/comment.service.spec.ts`
  - Test Cases:
    - `createComment(postId, authorId, content)` → 댓글 생성
    - `createReply(commentId, authorId, content)` → 대댓글 생성
    - `deleteComment(commentId, userId)` → 본인 댓글만 삭제

- [ ] **Test 4.4**: PostLikeService 단위 테스트
  - File: `apps/backend/src/board/post-like.service.spec.ts`
  - Test Cases:
    - `toggleLike(postId, userId)` → 좋아요 토글
    - `getLikeCount(postId)` → 좋아요 개수 조회

- [ ] **Test 4.5**: E2E 게시판 CRUD 테스트
  - File: `apps/backend/test/board.e2e-spec.ts`
  - Test Scenarios:
    - `POST /api/boards` → 게시판 생성 (관리자만)
    - `GET /api/boards` → 모든 게시판 조회
    - `POST /api/boards/:boardId/posts` → 게시글 작성 (이미지 포함)
    - `GET /api/boards/:boardId/posts` → 게시글 목록
    - `POST /api/posts/:postId/comments` → 댓글 작성
    - `POST /api/posts/:postId/like` → 좋아요

**🟢 GREEN: Implement to Make Tests Pass**

- [ ] **Task 4.6**: BoardService 구현
  - File: `apps/backend/src/board/board.service.ts`
  - CRUD 메서드 구현

- [ ] **Task 4.7**: PostService 구현
  - File: `apps/backend/src/board/post.service.ts`
  - CRUD + 조회수 + 이미지 업로드 연동
  - Storage Service Injection:
    ```typescript
    constructor(
      private prisma: PrismaService,
      @Inject('IStorageService') private storage: IStorageService,
    ) {}

    async createPost(userId, boardId, title, content, files?) {
      // 1. 이미지 업로드
      const imageIds = await Promise.all(
        files.map(f => this.storage.uploadFile(f, 'posts'))
      );
      
      // 2. Post 생성
      return this.prisma.post.create({
        data: { authorId: userId, boardId, title, content, imageIds },
      });
    }
    ```

- [ ] **Task 4.8**: CommentService 구현
  - File: `apps/backend/src/board/comment.service.ts`
  - 댓글 CRUD, 대댓글 지원

- [ ] **Task 4.9**: PostLikeService 구현
  - File: `apps/backend/src/board/post-like.service.ts`
  - 좋아요 토글 로직

- [ ] **Task 4.10**: BoardController, PostController, CommentController 구현
  - Files:
    - `apps/backend/src/board/board.controller.ts`
    - `apps/backend/src/board/post.controller.ts`
    - `apps/backend/src/board/comment.controller.ts`
  - REST API 엔드포인트 정의

- [ ] **Task 4.11**: BoardModule 생성
  - File: `apps/backend/src/board/board.module.ts`
  - StorageModule import 필수

**🔵 REFACTOR: Clean Up Code**

- [ ] **Task 4.12**: 코드 품질 개선
  - Pagination 추가 (게시글 목록)
  - Sorting 옵션 (최신순, 인기순, 조회수순)
  - 검색 기능 (제목, 내용)
  - DTO Validation (CreatePostDto, UpdatePostDto 등)
  - 관리자 권한 확인 (게시글 고정, 삭제 등)

#### Quality Gate ✋

**TDD Compliance**:
- [ ] 모든 단위 테스트 작성 및 통과
- [ ] E2E 테스트 통과
- [ ] Coverage ≥80%

**Build & Tests**:
- [ ] `npm test` → 모든 테스트 통과
- [ ] `npm run test:e2e` → 게시판 E2E 테스트 통과

**API Testing**:
- [ ] Postman으로 모든 엔드포인트 테스트
- [ ] 이미지 업로드 포함 게시글 작성 → Cloudinary에 이미지 업로드 확인
- [ ] 댓글, 대댓글 작성 및 조회
- [ ] 좋아요 토글 기능 확인

**Manual Testing**:
- [ ] 게시판 목록 조회 (카테고리별)
- [ ] 게시글 작성 (이미지 3장 첨부)
- [ ] 댓글 작성 및 대댓글
- [ ] 좋아요 버튼 클릭

---

### Phase 5: Enhanced Review System (Image Upload)
**Goal**: 리뷰에 이미지 첨부 기능 추가 및 아카이브 기능 강화
**Estimated Time**: 3 hours
**Status**: ✅ Complete

#### Tasks

**🔴 RED: Write Failing Tests First**

- [ ] **Test 5.1**: ReviewService 이미지 업로드 단위 테스트
  - File: `apps/backend/src/reviews/reviews.service.spec.ts`
  - Test Cases:
    - `createReview(dto, files)` → imageIds 배열 저장
    - 최대 5장 제한 확인

- [ ] **Test 5.2**: 사용자별 리뷰 아카이브 API 테스트
  - File: `apps/backend/src/reviews/reviews.service.spec.ts`
  - Test Cases:
    - `getReviewsByReceiver(userId)` → 받은 리뷰 목록 (이미지 URL 포함)
    - `getReviewsBySender(userId)` → 작성한 리뷰 목록

**🟢 GREEN: Implement to Make Tests Pass**

- [ ] **Task 5.3**: ReviewService 수정
  - File: `apps/backend/src/reviews/reviews.service.ts`
  - 변경:
    ```typescript
    async createReview(dto, userId, files?) {
      // 1. 이미지 업로드 (최대 5장)
      const imageIds = files?.length
        ? await Promise.all(
            files.slice(0, 5).map(f => this.storage.uploadFile(f, 'reviews'))
          )
        : [];

      // 2. Review 생성
      return this.prisma.review.create({
        data: { ...dto, senderId: userId, imageIds },
      });
    }

    async getReviewsByReceiver(userId) {
      const reviews = await this.prisma.review.findMany({
        where: { receiverId: userId },
        include: { sender: true, keywords: true },
      });

      // 3. imageIds → imageUrls 변환
      return reviews.map(r => ({
        ...r,
        imageUrls: r.imageIds.map(id => this.storage.getFileUrl(id)),
      }));
    }
    ```

- [ ] **Task 5.4**: ReviewController 수정
  - File: `apps/backend/src/reviews/reviews.controller.ts`
  - 엔드포인트:
    - `POST /api/reviews` → `@UseInterceptors(FilesInterceptor('images', 5))`
    - `GET /api/reviews/received/:userId` → 받은 리뷰 조회
    - `GET /api/reviews/sent/:userId` → 작성한 리뷰 조회

**🔵 REFACTOR: Clean Up Code**

- [ ] **Task 5.5**: 코드 품질 개선
  - 이미지 파일 타입 검증 (jpg, png만 허용)
  - 파일 크기 검증 (각 5MB 이하)
  - DTO에 `images` 필드 추가 및 Validation

#### Quality Gate ✋

**TDD Compliance**:
- [ ] 단위 테스트 및 E2E 테스트 통과
- [ ] Coverage ≥80%

**API Testing**:
- [ ] Postman으로 리뷰 작성 (이미지 3장 첨부)
- [ ] Cloudinary Dashboard에서 업로드된 이미지 확인
- [ ] 리뷰 조회 시 imageUrls에 실제 Cloudinary URL 반환 확인

---

### Phase 6: Data Cleanup Scheduler
**Goal**: 탈퇴 후 6개월 경과한 유저 데이터 완전 삭제 스케줄러
**Estimated Time**: 2 hours
**Status**: ✅ Complete

#### Tasks

**🔴 RED: Write Failing Tests First**

- [ ] **Test 6.1**: DataCleanupService 단위 테스트
  - File: `apps/backend/src/scheduler/data-cleanup.service.spec.ts`
  - Test Cases:
    - `cleanupDeletedUsers()` → 6개월 이상 경과한 유저 Hard Delete
    - Mock 시간 이용 (`jest.useFakeTimers()`)

**🟢 GREEN: Implement to Make Tests Pass**

- [ ] **Task 6.2**: Install @nestjs/schedule
  - 명령어: `npm install @nestjs/schedule`

- [ ] **Task 6.3**: DataCleanupService 구현
  - File: `apps/backend/src/scheduler/data-cleanup.service.ts`
  - 로직:
    ```typescript
    @Injectable()
    export class DataCleanupService {
      constructor(private prisma: PrismaService) {}

      @Cron('0 0 * * 0') // 매주 일요일 자정
      async cleanupDeletedUsers() {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const deleted = await this.prisma.user.deleteMany({
          where: {
            isDeleted: true,
            deletedAt: { lt: sixMonthsAgo },
          },
        });

        console.log(`Cleaned up ${deleted.count} users`);
      }
    }
    ```

- [ ] **Task 6.4**: SchedulerModule 설정
  - File: `apps/backend/src/app.module.ts`
  - `ScheduleModule.forRoot()` import

**🔵 REFACTOR: Clean Up Code**

- [ ] **Task 6.5**: 로깅 및 알림
  - 삭제 이벤트 로그 기록
  - 관리자 알림 (선택)

#### Quality Gate ✋

**TDD Compliance**:
- [ ] Mock 시간으로 스케줄러 동작 테스트
- [ ] 6개월 미만 유저는 삭제되지 않음 확인

---

## ⚠️ Risk Assessment

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| Cloudinary API 장애 | Low | High | IStorageService 인터페이스로 격리, 로컬 fallback 또는 S3로 즉시 전환 가능 |
| 게시판 스팸/어뷰징 | Medium | Medium | Rate Limiting, 신고 기능, 관리자 모니터링 |
| 이미지 저장 비용 초과 | Medium | Low | Cloudinary 무료 티어 모니터링, 이미지 압축/리사이징 적용 |
| Soft Delete 데이터 누적 | Low | Medium | 6개월 후 자동 삭제 스케줄러 구현 (Phase 6) |
| Migration 실패 | Low | High | Prisma migration 전 DB 백업, 테스트 환경에서 먼저 실행 |
| 성능 저하 (이미지 URL 생성) | Low | Medium | Redis 캐싱 고려, CDN 활용 |

---

## 🔄 Rollback Strategy

### If Phase 1 Fails
- Cloudinary 설정 제거 (`cloudinary.service.ts` 삭제)
- StorageModule import 제거
- `.env`에서 Cloudinary 환경 변수 제거

### If Phase 2 Fails
- Prisma migration rollback: `npx prisma migrate reset` (주의: 개발 환경만)
- 또는 수동으로 테이블 삭제 (Railway Dashboard)

### If Phase 3 Fails
- `UserService.deleteAccount` 메서드 제거
- `DeletedUserGuard` 제거
- API 엔드포인트 제거

### If Phase 4 Fails
- BoardModule 전체 제거
- Prisma migration에서 Board 관련 테이블 rollback

### If Phase 5 Fails
- ReviewService 이전 버전으로 복구
- Review 테이블의 `imageIds` 컬럼 사용 중단 (비우기)

---

## 📊 Progress Tracking

### Completion Status
- **Phase 1**: ⏳ 0%
- **Phase 2**: ⏳ 0%
- **Phase 3**: ⏳ 0%
- **Phase 4**: ⏳ 0%
- **Phase 5**: ⏳ 0%
- **Phase 6**: ⏳ 0%

**Overall Progress**: 0% complete

### Time Tracking
| Phase | Estimated | Actual | Variance |
|-------|-----------|--------|----------|
| Phase 1 | 4 hours | - | - |
| Phase 2 | 3 hours | - | - |
| Phase 3 | 4 hours | - | - |
| Phase 4 | 6 hours | - | - |
| Phase 5 | 3 hours | - | - |
| Phase 6 | 2 hours | - | - |
| **Total** | 22 hours | - | - |

---

## 📝 Notes & Learnings

### Implementation Notes
- (작업 중 발견한 인사이트 기록)

### Blockers Encountered
- (작업 중 발생한 문제 및 해결 방법 기록)

### Improvements for Future Plans
- (다음 계획 시 개선할 점)

---

## 📚 References

### Documentation
- [Cloudinary Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [NestJS File Upload](https://docs.nestjs.com/techniques/file-upload)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [NestJS Scheduling](https://docs.nestjs.com/techniques/task-scheduling)

### Related Issues
- Analysis Report: `C:\Users\kakio\.gemini\antigravity\brain\...\analysis_report.md`

---

## ✅ Migration Ready Check (완료 후 체크리스트)

- [ ] **Storage Abstraction**: DB에 `https://...` 전체 주소가 아닌 `cloud_id_123` 형태의 ID만 저장되는가?
- [ ] **Provider Independence**: CloudinaryService를 S3Service로 교체해도 UserService, PostService, ReviewService 등 비즈니스 로직이 영향받지 않는가?
- [ ] **Account Deletion**: 회원 탈퇴 시 유저의 프로필이 즉시 비공개 처리되는가?
- [ ] **Legal Compliance**: 탈퇴 후 6개월 경과 시 데이터 자동 삭제 스케줄러가 동작하는가?
- [ ] **Community Board**: 게시판 글에 사진을 여러 장 올려도 Cloudinary 대시보드에 잘 쌓이는가?
- [ ] **Review System**: 리뷰 작성 시 이미지 첨부 가능하며, 사용자별 리뷰 아카이브가 잘 조회되는가?
- [ ] **Test Coverage**: 모든 핵심 기능의 단위 테스트 및 E2E 테스트가 통과하는가?
- [ ] **Performance**: API 응답 시간이 허용 범위 내인가? (이미지 URL 생성 포함)
- [ ] **Security**: 민감 정보가 API 응답에 노출되지 않는가?
- [ ] **Documentation**: API 문서 및 README가 업데이트되었는가?

---

**Plan Status**: 🔄 Pending User Approval
**Next Action**: USER 검토 및 승인 대기
**Blocked By**: None
