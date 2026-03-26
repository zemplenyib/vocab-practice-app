# ── Build stage ────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Enable corepack so pnpm is available
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy manifests first for layer caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile

# Copy source
COPY tsconfig.base.json ./
COPY apps/api ./apps/api
COPY apps/web ./apps/web
COPY packages/shared ./packages/shared

# Build web and api (@vocab/shared has no build step — imported as TS source)
RUN pnpm --filter @vocab/web build && \
    pnpm --filter @vocab/api build

# Copy compiled frontend into API's public/ dir
RUN cp -r apps/web/dist apps/api/public

# ── Runtime stage ───────────────────────────────────────────────────────────────
FROM node:22-alpine AS runtime

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy manifests for production install
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Install only production deps (shared has none, but pnpm workspace needs its manifest)
RUN pnpm install --frozen-lockfile --prod

# Copy compiled output from builder
# (@vocab/shared is compiled into apps/api/dist by tsc — no separate copy needed)
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/public ./apps/api/public

# Migrations must live next to compiled output (db.ts resolves path from __dirname = dist/)
COPY apps/api/src/migrations ./apps/api/dist/migrations

ENV NODE_ENV=production
ENV PORT=3000
# DATABASE_URL is set at runtime via compose.yml (bind-mounted volume path)

EXPOSE 3000

CMD ["node", "apps/api/dist/index.js"]
