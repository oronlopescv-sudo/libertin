# Dockerfile simplificado para Easypanel
FROM node:20-alpine

# Instala dependências
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copia package.json
COPY package.json package-lock.json ./

# Instala node_modules (com timeout mais curto)
RUN npm install --legacy-peer-deps --no-audit --no-fund

# Copia código
COPY . .

# Gera Prisma client
RUN npx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Cria user
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Folder uploads
RUN mkdir -p /app/public/uploads && chown -R nextjs:nodejs /app/public /app/.next

# Muda user
USER nextjs

EXPOSE 3000
ENV PORT=3000
HOSTNAME="0.0.0.0"

# Comando CORRECTO para standalone Next.js
CMD ["node", ".next/standalone/server.js"]
