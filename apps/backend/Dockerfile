# 1. Base Image
FROM node:18-alpine AS builder

# 2. Set Working Directory
WORKDIR /app

# 3. Copy Root Package Files (for pnpm/npm workspace support if needed, though we act as isolated app here)
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/

# 4. Install Dependencies (including Dev dependencies for Nest CLI)
# We install modules in the root node_modules
RUN npm ci

# 5. Copy Source Code
COPY apps/backend ./apps/backend
COPY apps/backend/prisma ./apps/backend/prisma

# 6. Generate Prisma Client
WORKDIR /app/apps/backend
RUN npx prisma generate

# 7. Build Application
RUN npm run build

# --- Production Stage ---
FROM node:18-alpine AS runner

WORKDIR /app

# 8. Copy necessary files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma

# 9. Set Environment
ENV NODE_ENV production

# 10. Expose Port
EXPOSE 4000

# 11. Start Command
WORKDIR /app/apps/backend
CMD ["node", "dist/main"]
