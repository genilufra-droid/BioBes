FROM node:22-slim AS builder
WORKDIR /app
ARG VITE_AUTH_PROVIDER=local
ENV VITE_AUTH_PROVIDER=${VITE_AUTH_PROVIDER}
COPY package.json pnpm-lock.yaml .npmrc* ./
RUN npm install -g corepack@latest && corepack pnpm install --frozen-lockfile
COPY . .
RUN corepack pnpm run build

FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml .npmrc* ./
RUN npm install -g corepack@latest && corepack pnpm install --prod --frozen-lockfile && groupadd --system biobes && useradd --system --gid biobes biobes
COPY --from=builder /app/dist ./dist
RUN mkdir -p /var/lib/biobes/storage && chown -R biobes:biobes /app /var/lib/biobes
USER biobes
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD node -e "fetch('http://127.0.0.1:3000/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/index.js"]
