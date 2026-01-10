
# 1. 빌드 단계 (Builder stage)
FROM node:20-slim AS builder

# 빌드 환경에 필요한 도구 설치
RUN apt-get update && apt-get install -y \
    openssl \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

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
FROM node:20-slim AS runner

# Puppeteer 및 한글 폰트 설치
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-noto-cjk \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Puppeteer 환경 변수 설정
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app
ENV NODE_ENV production

# 실행에 필요한 파일만 복사
COPY --from=builder /app/apps/backend/package*.json ./
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/prisma ./prisma

# 프로덕션 의존성만 설치
RUN npm install --omit=dev

# Prisma Client 생성
RUN npx prisma generate

# 포트 설정
EXPOSE 8080

# DB 마이그레이션과 시드 실행 후 앱 시작
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node dist/src/main"]
