FROM node:20-alpine AS base

# Dependencias do sistema (necessario para o Prisma no Alpine)
RUN apk add --no-cache libc6-compat openssl

# 1. Instalacao das dependencias
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

# 2. Build da aplicacao
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# O Docker precisa saber que o Banco e SQLite aqui apenas para gerar o cliente
ENV DATABASE_URL="file:/app/prisma/dev.db"

# Gera o cliente do Prisma e builda o Next.js
RUN npx prisma generate
RUN npm run build

# 3. Imagem final para execucao
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Configura as permissoes do Prisma e diretorio de dados
RUN mkdir -p /app/prisma /app/data && chown -R nextjs:nodejs /app/prisma /app/data

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma

# Entrypoint que roda prisma db push antes de iniciar o server
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN sed -i 's/\r$//' docker-entrypoint.sh && chmod +x docker-entrypoint.sh

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]
