# Build from monorepo root context: docker build -f packages/server/Dockerfile .

# Whisper.cpp build stage
FROM debian:bookworm-slim AS whisper-builder

RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    pkg-config \
    libopenblas-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /whisper

# Clone and build whisper.cpp with OpenBLAS for CPU acceleration
RUN git clone --depth 1 https://github.com/ggerganov/whisper.cpp.git . \
    && cmake -B build -DGGML_BLAS=1 -DGGML_NATIVE=OFF \
    && cmake --build build --config Release -j$(nproc)

# Build stage
FROM node:22-bookworm-slim AS builder

# Install openssl for Prisma client generation
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Skip Puppeteer Chrome download (production uses system Chrome)
ENV PUPPETEER_SKIP_DOWNLOAD=true

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

# Install Chrome for Puppeteer (PDF generation), PostgreSQL 18 client (for pg_dump backup),
# and whisper.cpp runtime dependencies (ffmpeg for audio conversion, libopenblas for BLAS acceleration)
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    wget \
    gnupg \
    tzdata \
    lsb-release \
    ffmpeg \
    libopenblas0 \
    && mkdir -p /etc/apt/keyrings \
    && wget -qO- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /etc/apt/keyrings/google-chrome.gpg \
    && echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
    && wget -qO- https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /etc/apt/keyrings/pgdg.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/pgdg.gpg] http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable postgresql-client-18 --no-install-recommends \
    && ln -fs /usr/share/zoneinfo/Europe/Prague /etc/localtime \
    && dpkg-reconfigure -f noninteractive tzdata \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm (pinned to major version for reproducible builds)
RUN corepack enable && corepack prepare pnpm@10 --activate

# Copy whisper.cpp binary and shared libraries from builder
COPY --from=whisper-builder /whisper/build/bin/whisper-cli /usr/local/bin/whisper-cli
COPY --from=whisper-builder /whisper/build/src/libwhisper.so* /usr/local/lib/
COPY --from=whisper-builder /whisper/build/ggml/src/libggml*.so* /usr/local/lib/
COPY --from=whisper-builder /whisper/build/ggml/src/ggml-blas/libggml-blas.so* /usr/local/lib/

# Create proper symlinks for shared libraries to avoid ldconfig warnings
RUN chmod +x /usr/local/bin/whisper-cli \
    && cd /usr/local/lib \
    && for lib in libwhisper.so.* libggml.so.* libggml-base.so.* libggml-cpu.so.* libggml-blas.so.*; do \
         if [ -f "$lib" ] && [ ! -L "$lib" ]; then \
           base=$(echo "$lib" | sed 's/\.[0-9]*$//'); \
           ln -sf "$lib" "$base" 2>/dev/null || true; \
         fi; \
       done \
    && ldconfig

# Create whisper models directory (models mounted via volume)
RUN mkdir -p /models/whisper

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV WHISPER_CPP_PATH=/usr/local/bin/whisper-cli
ENV WHISPER_MODEL_PATH=/models/whisper/ggml-small.bin
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
ENV NODE_ENV=production
ENV TZ=Europe/Prague
ENV PORT=4000

WORKDIR /app

# Copy package.json and lockfile for reproducible installs
# The lockfile ensures consistent dependency resolution
COPY pnpm-lock.yaml ./pnpm-lock.yaml
COPY .npmrc ./
COPY packages/server/package.json ./package.json
RUN sed -i '/"@blizko\/shared"/d' package.json

# Install production dependencies only (lockfile helps with version resolution)
RUN pnpm install --prod

# Copy built files and prisma from builder
# Note: With Prisma v7, client is generated to src/generated/prisma/ and bundled by esbuild
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
