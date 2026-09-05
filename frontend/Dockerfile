# syntax=docker/dockerfile:1

# ─── Stage 1: Dependencies ──────────────────────────────────────────────────
FROM node:22-alpine AS deps

WORKDIR /app
COPY package.json package-lock.json ./

RUN npm ci

# ─── Stage 2: Development (hot reload via next dev) ─────────────────────────
FROM node:22-alpine AS dev

WORKDIR /app

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# package.json needed at runtime; src is bind-mounted by compose in dev
COPY package.json package-lock.json ./

EXPOSE 3000

# WATCHPACK_POLLING=true is required on Windows/WSL2 Docker bind mounts
# because inotify events are unreliable across the NTFS → ext4 boundary.
ENV WATCHPACK_POLLING=true
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["npm", "run", "dev"]

# ─── Stage 3: Production build ──────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ─── Stage 4: Production runtime (standalone output) ────────────────────────
FROM node:22-alpine AS prod

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# next build --standalone outputs a self-contained server.js
COPY --from=builder --chown=appuser:appgroup /app/.next/standalone ./
COPY --from=builder --chown=appuser:appgroup /app/.next/static ./.next/static
COPY --from=builder --chown=appuser:appgroup /app/public ./public

USER appuser

EXPOSE 3000

CMD ["node", "server.js"]
