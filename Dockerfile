# YmShotS API — Production Dockerfile
FROM node:20-alpine AS base
RUN npm install -g pnpm@9

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/db/package.json packages/db/
COPY packages/types/package.json packages/types/
COPY packages/utils/package.json packages/utils/
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile --prod=false

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build --filter=@ymshots/api

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/packages/db/prisma ./prisma
EXPOSE 3001
CMD ["node", "dist/index.js"]
