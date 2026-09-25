FROM node:22-bookworm-slim AS deps

WORKDIR /app

COPY apps/web/package.json ./apps/web/package.json
COPY packages/resume-schema/package.json ./packages/resume-schema/package.json
COPY packages/resume-schema/tsconfig.json ./packages/resume-schema/tsconfig.json
COPY packages/resume-schema/src ./packages/resume-schema/src

RUN npm install --prefix apps/web

WORKDIR /app/packages/resume-schema

RUN npm install \
    && npm run build


FROM node:22-bookworm-slim AS builder

WORKDIR /app

COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/resume-schema ./packages/resume-schema

COPY apps/web ./apps/web

WORKDIR /app/apps/web

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build


FROM node:22-bookworm-slim AS runner

WORKDIR /app/apps/web

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN groupadd --system --gid 1001 nextjs \
    && useradd --system --uid 1001 --gid nextjs nextjs

COPY --from=builder --chown=nextjs:nextjs /app/apps/web/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nextjs /app/apps/web/.next ./.next
COPY --from=builder --chown=nextjs:nextjs /app/apps/web/public ./public
COPY --from=builder --chown=nextjs:nextjs /app/apps/web/package.json ./package.json
COPY --from=builder --chown=nextjs:nextjs /app/packages/resume-schema ./../../packages/resume-schema

USER nextjs

EXPOSE 3000

CMD ["npm", "run", "start"]