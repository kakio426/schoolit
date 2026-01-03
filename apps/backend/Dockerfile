# 1. 빌드 단계 (Builder stage)
FROM node:18-alpine AS builder

# 빌드 환경에서도 Prisma 엔진 호환을 위해 설치
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# 루트와 백엔드의 패키지 파일 복사
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/

# 빌드에 필요한 모든 의존성 설치
RUN npm ci

# 소스 복사 및 빌드
COPY apps/backend ./apps/backend
WORKDIR /app/apps/backend
RUN npx prisma generate
RUN npm run build

# 2. 실행 단계 (Runner stage)
FROM node:18-alpine AS runner

# Prisma와 시스템 라이브러리 호환성을 위해 설치
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app
ENV NODE_ENV production

# 실행에 필요한 파일만 복사
COPY --from=builder /app/apps/backend/package*.json ./
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/prisma ./prisma

# 프로덕션 의존성만 깔끔하게 새로 설치 (경로 문제 해결)
RUN npm install --omit=dev

# Prisma Client 및 Seed 생성
RUN npx prisma generate

# 포트 설정
EXPOSE 8080

# DB 마이그레이션과 시드 실행 후 앱 시작
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node dist/src/main"]
