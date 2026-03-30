FROM node:22.11.0-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# 런타임 스테이지
FROM node:22.11.0-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./

# 필요한 파일들 복사
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/tsconfig.node.json ./
COPY --from=builder /app/postcss.config.js ./
COPY --from=builder /app/tailwind.config.ts ./
COPY --from=builder /app/global.d.ts ./
COPY --from=builder /app/.env ./

RUN npm ci --omit=dev
EXPOSE 3100
CMD ["npm", "start"]