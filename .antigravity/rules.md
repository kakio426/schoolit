📜 Project Rules: School Match

Created by Antigravity
학교와 검증된 인력을 잇는 신뢰 기반 매칭 플랫폼 개발 규칙서

1. Core Philosophy (핵심 철학)

🛡️ Trust & Safety First

검증 우선: 모든 로직은 "사용자의 신뢰"를 최우선으로 설계한다. (예: 인증 없는 접근 차단, 민감 정보 마스킹)

개인정보 보호: 연락처 등 개인정보는 명시적 동의(매칭 성사 등) 전까지 절대 노출하지 않는다.

📱 Mobile-First Experience

반응형 기본: 모든 UI는 모바일 뷰포트(360px~)를 기준으로 먼저 설계하고, 데스크탑으로 확장한다.

접근성: PC와 모바일 어디서든 동일한 경험을 제공한다 (PWA 지원 고려).

🧪 Test-Driven Development (TDD)

No Test, No Code: 실패하는 테스트(Red) 없이는 프로덕션 코드를 작성하지 않는다.

Red-Green-Refactor: [실패 → 성공 → 리팩토링] 사이클을 엄격히 준수한다.

Quality Gate: 각 개발 Phase는 정의된 테스트 통과 기준을 만족해야만 완료된다.

2. Tech Stack & Conventions

🏗️ Architecture (Monorepo)

Backend: NestJS (Strict Module Structure)

Frontend: Next.js 14+ (App Router)

Database: PostgreSQL + Prisma ORM

Styling: Tailwind CSS (Mobile-first Utility Classes)

Language: TypeScript (Strict Mode)

📂 Directory Structure

root/
├── apps/
│   ├── backend/   # NestJS Server
│   └── frontend/  # Next.js Client
├── packages/      # Shared Libraries (DTOs, Types)
├── docs/          # Plans & Roadmaps
└── rules.md       # This file


📝 Naming Conventions

Files: kebab-case (e.g., user-profile.component.tsx, auth.service.ts)

Classes: PascalCase (e.g., AuthService, UserProfile)

Variables/Functions: camelCase (e.g., isValidUser, createProfile)

Interfaces: I 접두어 금지, PascalCase 사용 (e.g., User, AuthPayload)

Database: snake_case for columns, PascalCase for Prisma Models

3. Development Workflow

Step 1: Planning (Feature Planner)

사용자가 기능을 요청하면 plan-template.md를 사용하여 **구현 계획(Plan)**을 먼저 작성한다.

계획에는 1~4시간 단위의 Phase와 Quality Gate가 반드시 포함되어야 한다.

사용자의 **승인(Approval)**을 얻은 후 코딩을 시작한다.

Step 2: Implementation (TDD Cycle)

🔴 Red: 요구사항을 검증하는 실패하는 테스트 코드를 먼저 작성한다.

🟢 Green: 테스트를 통과하기 위한 최소한의 코드를 작성한다.

🔵 Refactor: 중복 제거, 가독성 향상, 성능 최적화를 수행한다 (테스트 통과 유지).

Step 3: Verification (Quality Gate)

모든 Phase 종료 시 아래 항목을 검증한다:

[ ] 빌드 및 린트 오류 없음

[ ] 작성된 테스트 100% 통과

[ ] 모바일/PC 반응형 UI 확인

4. Git & Commit Rules

Commit Message Format

type(scope): subject

Types:

feat: 새로운 기능 추가

fix: 버그 수정

docs: 문서 수정

style: 코드 포맷팅 (로직 변경 없음)

refactor: 코드 리팩토링 (기능 변경 없음)

test: 테스트 코드 추가/수정

chore: 빌드 태스크, 패키지 매니저 설정 등

Example:

feat(auth): add jwt strategy and guards

test(user): add unit tests for user creation

docs(plan): update part 1 implementation plan

5. Antigravity Special Rules 🚀

S2B & 행정 친화적: 코드를 짤 때 학교 행정 용어와 프로세스(기안, 품의, 계약 등)를 존중한다.

선생님의 시간은 금이다: 불필요한 클릭, 복잡한 입력을 최소화하는 UX를 지향한다.

확장성 대비: 언제든 타 지역 교육청이나 다른 카테고리로 확장할 수 있도록 하드코딩을 지양한다.