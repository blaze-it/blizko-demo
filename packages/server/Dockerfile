# Build from monorepo root context: docker build -f packages/server/Dockerfile .

# Build stage
FROM node:22-bookworm-slim AS builder

# Install openssl for Prisma client generation
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Install pnpm (pinned to major version for reproducible builds)
RUN corepack enable && corepack prepare pnpm@10 --activate

WORKDIR /app

# Copy workspace config, lockfile, and package files
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY .npmrc ./
COPY package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/server/package.json ./packages/server/

# Install dependencies (--ignore-scripts skips prepare scripts since source isn't copied yet)
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy shared package source and build it
COPY packages/shared ./packages/shared
RUN pnpm --filter @blizko/shared build

# Copy and generate Prisma
# Note: DATABASE_URL is required for prisma.config.ts but not actually used at build time
COPY packages/server/prisma ./packages/server/prisma
COPY packages/server/prisma.config.ts ./packages/server/prisma.config.ts
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
RUN pnpm --filter @blizko/server db:generate

# Copy source code
COPY packages/server ./packages/server

# Build with esbuild
WORKDIR /app/packages/server
RUN pnpm build

# Production stage
FROM node:22-bookworm-slim AS production

RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    wget \
    tzdata \
    && ln -fs /usr/share/zoneinfo/Europe/Prague /etc/localtime \
    && dpkg-reconfigure -f noninteractive tzdata \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm (pinned to major version for reproducible builds)
RUN corepack enable && corepack prepare pnpm@10 --activate

ENV NODE_ENV=production
ENV TZ=Europe/Prague
ENV PORT=4000

WORKDIR /app

# Copy package.json and lockfile for reproducible installs
COPY pnpm-lock.yaml ./pnpm-lock.yaml
COPY .npmrc ./
COPY packages/server/package.json ./package.json
RUN sed -i '/"@blizko\/shared"/d' package.json

# Install production dependencies only
RUN pnpm install --prod

# Copy built files and prisma from builder
COPY --from=builder /app/packages/server/dist ./dist
COPY --from=builder /app/packages/server/prisma ./prisma
COPY --from=builder /app/packages/server/prisma.config.ts ./prisma.config.ts

# Copy startup script
COPY packages/server/start.sh ./start.sh
RUN chmod +x ./start.sh

EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

CMD ["./start.sh"]
