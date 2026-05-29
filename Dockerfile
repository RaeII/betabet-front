# syntax=docker/dockerfile:1

FROM oven/bun:1-alpine AS deps

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM deps AS build

COPY tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts index.html components.json ./
COPY src ./src

RUN bun run build

FROM nginx:1.27-alpine AS runtime

ENV API_UPSTREAM=http://host.docker.internal:3000

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/health || exit 1
