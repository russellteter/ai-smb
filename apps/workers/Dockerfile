FROM node:20-alpine AS deps
WORKDIR /app
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
RUN corepack enable && corepack prepare pnpm@9.6.0 --activate
COPY packages ./packages
COPY apps/workers/package.json ./apps/workers/package.json
RUN pnpm install --filter @mothership/shared --filter @mothership/db --filter @mothership/workers --prefer-offline

FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN pnpm -r run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/workers/dist ./dist
COPY --from=build /app/apps/workers/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
CMD ["node", "dist/index.js"]

