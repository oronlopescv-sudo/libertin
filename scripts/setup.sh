#!/bin/bash

# 🚀 LIBERTINELOVER - Setup & Deploy Script
# Execute com: bash scripts/setup.sh

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║         🚀 LIBERTINELOVER - SETUP AUTOMÁTICO 🚀              ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar Node.js
echo -e "${YELLOW}1️⃣  Verificando Node.js...${NC}"
if command -v node &> /dev/null; then
  echo -e "${GREEN}✅ Node.js: $(node --version)${NC}"
else
  echo -e "${RED}❌ Node.js não encontrado!${NC}"
  exit 1
fi

# 2. Verificar .env
echo ""
echo -e "${YELLOW}2️⃣  Configurando .env...${NC}"
if [ ! -f .env.local ]; then
  echo -e "${YELLOW}⚠️  Arquivo .env.local não encontrado!${NC}"
  echo "Copie .env.example para .env.local e configure com seus dados:"
  echo ""
  echo "  cp .env.example .env.local"
  echo "  nano .env.local"
  echo ""
  exit 1
else
  echo -e "${GREEN}✅ Arquivo .env.local encontrado${NC}"
fi

# 3. Instalar dependências
echo ""
echo -e "${YELLOW}3️⃣  Instalando dependências...${NC}"
if npm install; then
  echo -e "${GREEN}✅ Dependências instaladas${NC}"
else
  echo -e "${RED}❌ Erro ao instalar dependências${NC}"
  exit 1
fi

# 4. Setup Prisma
echo ""
echo -e "${YELLOW}4️⃣  Configurando banco de dados...${NC}"
if npx prisma migrate deploy; then
  echo -e "${GREEN}✅ Migrações aplicadas${NC}"
else
  echo -e "${YELLOW}⚠️  Erro em migrações (pode ser normal na primeira vez)${NC}"
fi

# 5. Seed pricing plans
echo ""
echo -e "${YELLOW}5️⃣  Populando planos de preço...${NC}"
if npx tsx prisma/seed-pricing.ts; then
  echo -e "${GREEN}✅ Planos de preço inseridos${NC}"
else
  echo -e "${YELLOW}⚠️  Planos de preço podem já existir${NC}"
fi

# 6. Build
echo ""
echo -e "${YELLOW}6️⃣  Fazendo build do projeto...${NC}"
if npm run build; then
  echo -e "${GREEN}✅ Build concluído${NC}"
else
  echo -e "${RED}❌ Erro ao fazer build${NC}"
  exit 1
fi

# 7. Done
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo -e "║         ${GREEN}✅ SETUP CONCLUÍDO COM SUCESSO! ✅${NC}"
echo "║                                                                ║"
echo "║  Próximo passo: npm start                                     ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
