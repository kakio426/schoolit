FROM node:18-alpine AS builder

# Set working directory to root of the monorepo
WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy backend package files to its specific location
COPY apps/backend/package*.json ./apps/backend/

# Install dependencies for the entire workspace (including dev dependencies for building)
# standard npm workspaces behavior will stick modules in root node_modules or hoist them
RUN npm ci

# Copy the backend source code
COPY apps/backend ./apps/backend

# Generate Prisma Client (Needs schema)
WORKDIR /app/apps/backend
# Ensure prisma schema exists before generating
COPY apps/backend/prisma ./prisma
RUN npx prisma generate

# Build the backend application
RUN npm run build

# --- Production Stage ---
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

# Copy necessary artifacts from builder
# We need root node_modules because that's where dependencies are installed in a workspace setup
COPY --from=builder /app/node_modules ./node_modules
# If backend had its own node_modules (unhoisted), copy them too (safety check, though likely empty/non-existent with npm ci)

# Copy built assets
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma

# Expose port
EXPOSE 4000

# Set working directory to backend
WORKDIR /app/apps/backend

# Start the application directly
# Find main.js and execute it, handling potential directory structure variations
CMD ["sh", "-c", "node $(find dist -name main.js -print -quit)"]
