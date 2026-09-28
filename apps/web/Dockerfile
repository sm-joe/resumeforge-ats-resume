# syntax=docker/dockerfile:1.7

# ============================================================
# STAGE 1: Dependencies
# ============================================================
FROM node:22-bookworm-slim AS deps

WORKDIR /app

# Shared schema package metadata/source
COPY packages/resume-schema/package.json ./packages/resume-schema/package.json
COPY packages/resume-schema/tsconfig.json ./packages/resume-schema/tsconfig.json
COPY packages/resume-schema/src ./packages/resume-schema/src

# Web application metadata
COPY apps/web/package.json ./apps/web/package.json

# Install web dependencies
WORKDIR /app/apps/web

RUN --mount=type=cache,target=/root/.npm \
    npm install

# Build the shared schema package
WORKDIR /app/packages/resume-schema

RUN --mount=type=cache,target=/root/.npm \
    npm install \
    && npm run build


# ============================================================
# STAGE 2: Build
# ============================================================
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Bring in dependency layers
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/resume-schema ./packages/resume-schema

# Application source
COPY apps/web ./apps/web

WORKDIR /app/apps/web

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Verify Next.js generated the expected standalone runtime.
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

# Dedicated non-root runtime user
RUN groupadd --system --gid 1001 nextjs \
    && useradd --system --uid 1001 --gid nextjs nextjs

# Next.js standalone server
COPY --from=builder --chown=nextjs:nextjs \
    /app/apps/web/.next/standalone \
    ./

# Static assets are not automatically included in standalone output.
COPY --from=builder --chown=nextjs:nextjs \
    /app/apps/web/.next/static \
    ./.next/static

# Public assets
COPY --from=builder --chown=nextjs:nextjs \
    /app/apps/web/public \
    ./public

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:3000').then(r => { if (!r.ok) process.exit(1) }).catch(() => process.exit(1))"

CMD ["node", "server.js"]