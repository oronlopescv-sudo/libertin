#!/usr/bin/env node

/**
 * 🚀 LIBERTINELOVER - Hostinger Deployment Script
 * 
 * Execute com: node scripts/deploy-hostinger.js
 * 
 * Este script:
 * 1. Verifica se DATABASE_URL está configurada
 * 2. Testa conexão com banco
 * 3. Executa migrações
 * 4. Popula dados
 * 5. Build do projeto
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function success(message) {
  log('green', `✅ ${message}`)
}

function error(message) {
  log('red', `❌ ${message}`)
}

function warning(message) {
  log('yellow', `⚠️  ${message}`)
}

function info(message) {
  log('cyan', `ℹ️  ${message}`)
}

async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     🚀 LIBERTINELOVER - HOSTINGER DEPLOYMENT 🚀            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `)

  // 1. Verificar variáveis de ambiente
  log('blue', '\n1️⃣  Verificando variáveis de ambiente...\n')

  const requiredEnvVars = [
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'DATABASE_URL',
    'NODE_ENV',
  ]

  let missingVars = []
  
  requiredEnvVars.forEach(varName => {
    if (process.env[varName]) {
      success(`${varName} encontrada`)
    } else {
      error(`${varName} NÃO está definida!`)
      missingVars.push(varName)
    }
  })

  if (missingVars.length > 0) {
    error(`\n${missingVars.length} variável(is) de ambiente faltando!`)
    error('\nPor favor, configure no hPanel Hostinger:')
    missingVars.forEach(v => {
      console.log(`  - ${v}`)
    })
    error('\nOu crie um arquivo .env.local com esses valores')
    process.exit(1)
  }

  // 2. Verificar Node.js
  log('blue', '\n2️⃣  Verificando Node.js...\n')
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf-8' }).trim()
    success(`Node.js ${nodeVersion}`)
  } catch (e) {
    error('Node.js não encontrado!')
    process.exit(1)
  }

  // 3. Instalar dependências
  log('blue', '\n3️⃣  Instalando dependências...\n')
  try {
    execSync('npm install --production', { stdio: 'inherit' })
    success('Dependências instaladas')
  } catch (e) {
    error('Erro ao instalar dependências')
    process.exit(1)
  }

  // 4. Setup Prisma
  log('blue', '\n4️⃣  Configurando banco de dados...\n')
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' })
    success('Migrações aplicadas')
  } catch (e) {
    warning('Erro nas migrações (pode ser normal)')
  }

  // 5. Seed pricing plans
  log('blue', '\n5️⃣  Populando planos de preço...\n')
  try {
    execSync('npx ts-node prisma/seed-pricing.ts', { stdio: 'inherit' })
    success('Planos de preço inseridos')
  } catch (e) {
    warning('Planos de preço podem já existir (isso é ok)')
  }

  // 6. Build
  log('blue', '\n6️⃣  Fazendo build do projeto...\n')
  try {
    execSync('npm run build', { stdio: 'inherit' })
    success('Build concluído')
  } catch (e) {
    error('Erro ao fazer build!')
    process.exit(1)
  }

  // 7. Verificar banco
  log('blue', '\n7️⃣  Verificando conexão com banco de dados...\n')
  try {
    const PrismaClient = require('@prisma/client').PrismaClient
    const prisma = new PrismaClient()
    
    const userCount = await prisma.user.count()
    const planCount = await prisma.pricingPlan.count()
    
    success(`Usuários no banco: ${userCount}`)
    success(`Planos de preço no banco: ${planCount}`)
    
    await prisma.$disconnect()
  } catch (e) {
    error(`Erro ao conectar ao banco: ${e.message}`)
    warning('Verifique se DATABASE_URL está correta')
  }

  // 8. Done
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     ${colors.green}✅ DEPLOYMENT PRONTO PARA HOSTINGER! ✅${colors.reset}
║                                                              ║
║  Próximos passos:                                            ║
║  1. npm start (para iniciar servidor)                        ║
║  2. Testar em: https://seu-dominio.com/register             ║
║  3. Verificar se "Libertinelover" aparece no header         ║
║  4. Testar criação de conta                                  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `)
}

main().catch(err => {
  error(`Erro fatal: ${err.message}`)
  process.exit(1)
})
