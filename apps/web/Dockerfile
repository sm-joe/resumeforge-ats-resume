# syntax=docker/dockerfile:1.7

# ============================================================
# STAGE 1: Dependencies
# ============================================================
FROM node:22-bookworm-slim AS deps

WORKDIR /app

# ------------------------------------------------------------
# Shared resume schema
# Copy dependency metadata first so this layer is cached
# unless the schema dependency definition changes.
# ------------------------------------------------------------
COPY packages/resume-schema/package.json \
     packages/resume-schema/package-lock.json \
     ./packages/resume-schema/

RUN --mount=type=cache,id=resumeforge-npm-schema,target=/root/.npm \
    npm ci \
    --prefix ./packages/resume-schema \
    --no-audit \
    --no-fund

# Copy schema source only after dependencies are installed.
COPY packages/resume-schema/tsconfig.json \
     ./packages/resume-schema/tsconfig.json

COPY packages/resume-schema/src \
     ./packages/resume-schema/src

# Build shared schema.
RUN npm run build --prefix ./packages/resume-schema


# ------------------------------------------------------------
# Web application dependencies
# ------------------------------------------------------------
COPY apps/web/package.json \
     apps/web/package-lock.json \
     ./apps/web/

RUN --mount=type=cache,id=resumeforge-npm-web,target=/root/.npm \
    npm ci \
    --prefix ./apps/web \
    --no-audit \
    --no-fund


# ============================================================
# STAGE 2: Build
# ============================================================
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Reuse dependency layers.
COPY --from=deps /app/apps/web/node_modules \
                  ./apps/web/node_modules

COPY --from=deps /app/packages/resume-schema \
                  ./packages/resume-schema

# Copy application source only after dependencies are available.
COPY apps/web ./apps/web

WORKDIR /app/apps/web

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Verify standalone output.
RUN test -f .next/standalone/server.js \
    && test -d .next/static \
    && test -n "$(find .next/static -type f -print -quit)"


# ============================================================
# STAGE 3: Minimal Production Runtime
# ============================================================
FROM node:22-bookworm-slim AS runner

RUN npm install -g npm@latest && npm cache clean --force

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Dedicated non-root runtime user.
RUN groupadd --system --gid 1001 nextjs \
    && useradd --system --uid 1001 --gid nextjs nextjs

# Next.js standalone runtime.
COPY --from=builder --chown=nextjs:nextjs \
    /app/apps/web/.next/standalone \
    ./

# Static assets.
COPY --from=builder --chown=nextjs:nextjs \
    /app/apps/web/.next/static \
    ./.next/static

# Public assets.
COPY --from=builder --chown=nextjs:nextjs \
    /app/apps/web/public \
    ./public

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:3000').then(r => { if (!r.ok) process.exit(1) }).catch(() => process.exit(1))"

CMD ["node", "server.js"]