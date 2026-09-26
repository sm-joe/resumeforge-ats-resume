# syntax=docker/dockerfile:1.7

# --- STAGE 1: Install Dependencies ---
FROM node:22-bookworm-slim AS deps
WORKDIR /app

# Explicitly copy sub-package files using exact absolute folder structures
COPY packages/resume-schema/package.json ./packages/resume-schema/package.json
COPY packages/resume-schema/tsconfig.json ./packages/resume-schema/tsconfig.json
COPY packages/resume-schema/src ./packages/resume-schema/src

# Explicitly copy the web app metadata configurations
COPY apps/web/package.json ./apps/web/package.json

# Step inside the web directory to install its dependencies locally
WORKDIR /app/apps/web
RUN --mount=type=cache,target=/root/.npm npm install --prefix apps/web

# Step inside the internal schema package to build it locally
WORKDIR /app/packages/resume-schema
RUN npm install && npm run build


# --- STAGE 2: Build Application ---
FROM node:22-bookworm-slim AS builder
WORKDIR /app

# Bring in all installed modules and compiled states from Stage 1
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/resume-schema ./packages/resume-schema
COPY apps/web ./apps/web

WORKDIR /app/apps/web
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# Prevent a broken image if Next.js fails to generate browser assets.
RUN test -d .next/static && test -n "$(find .next/static -type f -print -quit)"

# --- STAGE 3: Clean, Secure Runner ---
FROM node:22-bookworm-slim AS runner
WORKDIR /app/apps/web

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN groupadd --system --gid 1001 nextjs && useradd --system --uid 1001 --gid nextjs nextjs

# Standalone mode expects you to copy to the root workdir, not the app subdirectory
COPY --from=builder --chown=nextjs:nextjs /app/apps/web/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nextjs /app/apps/web/.next ./.next
COPY --from=builder --chown=nextjs:nextjs /app/apps/web/public ./public
COPY --from=builder --chown=nextjs:nextjs /app/apps/web/package.json ./package.json

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:3000').then(r => { if (!r.ok) process.exit(1) }).catch(() => process.exit(1))"

# FIX: Execute the server.js file from the root /app context where it was compiled
CMD ["npm", "run", "start"]

