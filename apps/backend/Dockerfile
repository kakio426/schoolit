# 1. Base Image
FROM node:18-alpine AS builder

# 2. Set Working Directory
WORKDIR /app

# 3. Copy Backend Package Files
# We treat backend as a standalone app to avoid workspace path issues
COPY apps/backend/package*.json ./
# If there are local packages/libs used, they should be handled differently, 
# but for now we assume backend is self-contained or dependencies are in npm registry.

# 4. Install Dependencies
RUN npm install

# 5. Copy Source Code
COPY apps/backend .

# 6. Generate Prisma Client
RUN npx prisma generate

# 7. Build Application
RUN npm run build

# --- Production Stage ---
FROM node:18-alpine AS runner

WORKDIR /app

# 8. Set Environment
ENV NODE_ENV production

# 9. Copy necessary files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

# 10. Expose Port
EXPOSE 4000

# 11. Start Command
CMD ["node", "dist/main"]
