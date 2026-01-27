# Build from monorepo root context: docker build -f packages/client/Dockerfile .

FROM node:22-alpine AS base

# Install pnpm (pinned to major version for reproducible builds)
RUN corepack enable && corepack prepare pnpm@10 --activate

FROM base AS builder
WORKDIR /app

# Build argument for API URL
ARG VITE_API_URL=https://blizko-api.blaze.codes
ENV VITE_API_URL=${VITE_API_URL}

# Copy workspace config, lockfile, and package files
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY .npmrc ./
COPY package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/server/package.json ./packages/server/
COPY packages/client/package.json ./packages/client/

# Install all dependencies (--ignore-scripts skips prepare scripts since source isn't copied yet)
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy shared package source and build it
COPY packages/shared ./packages/shared
RUN pnpm --filter @blizko/shared build

# Copy server source (needed for type imports)
COPY packages/server ./packages/server

# Copy client source
COPY packages/client ./packages/client

# Build client package
WORKDIR /app/packages/client
RUN pnpm build

# Production stage - use serve for SPA
FROM base AS production

# Setup pnpm global directory and install serve
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN pnpm add -g serve@latest

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app
COPY --from=builder /app/packages/client/dist ./

# Create serve.json for API proxy and caching
RUN echo '{"public": ".", "rewrites": [{"source": "/api/**", "destination": "/api"}], "headers": [{"source": "assets/**", "headers": [{"key": "Cache-Control", "value": "public, max-age=31536000, immutable"}]}]}' > serve.json

RUN chown -R nodejs:nodejs /app

# Install wget for health check
RUN apk add --no-cache wget

USER nodejs

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# -s flag enables SPA mode (serves index.html for all routes)
CMD ["serve", "-s", ".", "-l", "80"]
