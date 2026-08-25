FROM node:22-slim
WORKDIR /app
ARG VITE_AUTH_PROVIDER=local
ENV VITE_AUTH_PROVIDER=${VITE_AUTH_PROVIDER}
COPY . .
RUN npm install -g corepack@latest && corepack pnpm install --frozen-lockfile && corepack pnpm run build
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
