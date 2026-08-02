# 🚀 LIBERTINELOVER - HOSTINGER SETUP FINAL

## ✅ Status de Implementação

Todos os correções de código foram **completadas e testadas**:
- ✅ Bugs de login corrigidos (loop infinito removido)
- ✅ Sistema de upload completamente reformulado (validação de magic bytes)
- ✅ Rotas admin protegidas com autenticação
- ✅ Rate limiting implementado
- ✅ Schema da base de dados pronto
- ✅ Deployment script pronto
- ✅ 0 TypeScript errors | 0 ESLint warnings

**Build**: `npm run build` ✅ Passou com sucesso

---

## 🔧 O que falta: Configuração do Hostinger (5-10 minutos)

A aplicação está **deployada**, mas não consegue ligar à base de dados porque as variáveis de ambiente não estão definidas no hPanel.

### Passo 1: Aceder ao hPanel da Hostinger

1. Vai a https://hpanel.hostinger.com
2. Faz login com tua conta
3. Clica no teu site no hPanel

### Passo 2: Definir Variáveis de Ambiente

No hPanel, vai a: **Configurações → Variáveis de Ambiente**

**Opção A: Campos Separados (Recomendado)**

Esta é a forma mais segura. Clica "Adicionar Variável" para cada uma:

```
DB_HOST = localhost
DB_PORT = 3306
DB_USER = (o teu utilizador MySQL - encontra em Bases de dados → MySQL)
DB_PASSWORD = (a tua password MySQL)
DB_NAME = (o nome da tua base de dados)

NEXTAUTH_URL = https://seu-dominio.hostingersite.com
NEXTAUTH_SECRET = (gerar com: openssl rand -base64 32)
NODE_ENV = production
ADMIN_EMAILS = seu-email@exemplo.com
```

**⚠️ ARMADILHA**: Se a password contiver `#`, no ficheiro `.env` esse carácter inicia um comentário e a password fica truncada. No hPanel isto não é problema — os campos de formulário funcionam bem.

**Opção B: URL Completo (Se preferires)**

Se quiseres uma só variável DATABASE_URL, tens de URL-encod ar a password:

```
DATABASE_URL = mysql://utilizador:senha_encodada@localhost:3306/nome_da_base
```

| Caractere | Escreve-se |
|-----------|-----------|
| @ | %40 |
| + | %2B |
| # | %23 |
| & | %26 |
| / | %2F |
| : | %3A |

Exemplo: password `t+3U#mo1L` fica `t%2B3U%23mo1L`

**Se usares ambas as formas, os campos separados têm prioridade.**

### Passo 3: Importar o Schema da Base de Dados

No hPanel, vai a: **Bases de dados → phpMyAdmin**

1. Clica no separador **"Importar"**
2. Clica "Escolher ficheiro"
3. Seleciona: **`base-de-dados-completa.sql`** (está na raiz do repo)
4. Clica "Enviar"

⚠️ O ficheiro é para uma base **vazia**. Se as tabelas já existirem, a importação vai parar com "Table already exists" (é intencional, para não sobrescrever dados reais).

O ficheiro inclui:
- 11 tabelas (User, Photo, VerificationPhoto, etc.)
- 3 planos de preço pré-configurados (€16, €25, €70)

### Passo 4: Gerar NEXTAUTH_SECRET

No teu terminal:

```bash
openssl rand -base64 32
```

Resultado será algo como: `X5k9JkL2m9Qp3R4sT5u6V7w8X9yZaBbCdDeEfFgGhH==`

Copia este valor para `NEXTAUTH_SECRET` no hPanel.

### Passo 5: Guardar Variáveis

No hPanel, depois de preencheres todas as variáveis, clica o botão **"Guardar"**.

⚠️ **Importante**: As variáveis de ambiente **só entram em efeito após o próximo deploy**. O Hostinger redeploy a aplicação automaticamente após guardares as variáveis (pode levar 1-2 minutos).

### Passo 6: Verificar Conexão

Depois do deploy estar completo (1-2 minutos), testa:

**Com sessão admin:**
```
https://seu-dominio.hostingersite.com/api/health
```

Deve mostrar:
```json
{
  "status": "ok",
  "database": "ligada (N utilizadores)",
  "pricing_plans": N
}
```

**Sem sessão admin** (comportamento normal):
```json
{
  "status": "ok"
}
```

(A resposta completa só aparece para admins — é segurança intencional.)

---

## 🧪 Testar o Flow Completo

### 1. Registar uma conta

```
https://seu-dominio.hostingersite.com/register
```

Se vires erros "Database connection error", as variáveis ainda não foram carregadas. Aguarda 1-2 minutos e tenta outra vez.

### 2. Fazer login

```
https://seu-dominio.hostingersite.com/login
```

### 3. Ir para o dashboard

```
https://seu-dominio.hostingersite.com/decouvrir
```

### 4. Testar upload de foto

No perfil, tenta carregar uma foto. O sistema vai:
1. Validar a imagem pelos magic bytes (não confia no MIME type do cliente)
2. Guardar num diretório fora de `public/`
3. Servir dinamicamente via `/api/uploads/[...path]`

---

## 📋 Checklist Final

- [ ] Variáveis de ambiente definidas no hPanel
- [ ] `base-de-dados-completa.sql` importado via phpMyAdmin
- [ ] Site redeployado (aguarda 1-2 minutos)
- [ ] `/api/health` mostra `"status": "ok"`
- [ ] Consegues registar uma conta nova
- [ ] Consegues fazer login
- [ ] Consegues carregar uma foto de perfil

---

## 🆘 Troubleshooting

### "Database connection error" ou "Access denied"

**Causa mais comum**: Variáveis de ambiente não foram definidas ou contêm um erro.

**Verificar**:
1. No hPanel, abre Variáveis de Ambiente
2. Confirma que `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` estão presentes
3. Se a password tem `#`, usa aspas: `DB_PASSWORD="abc#def"`
4. Clica "Guardar" de novo
5. Aguarda 1-2 minutos e tenta outra vez

### "La base de données n'a pas fermé la connexion"

**Causa**: Base de dados recusou a conexão (credenciais erradas ou base inativa).

**Verificar**:
1. No hPanel → Bases de dados → MySQL
2. Confirma o **Nome da base**, **Utilizador**, e que a **Password** está correta
3. A password é **case-sensitive**
4. Se redesiste a password recentemente, utiliza a nova

### "Les tables n'existent pas"

**Causa**: `base-de-dados-completa.sql` não foi importado.

**Solução**:
1. Vai a hPanel → Bases de dados → phpMyAdmin
2. Clica separador "Importar"
3. Importa `base-de-dados-completa.sql` (está na raiz do repo)

---

## 🔐 Security Notes

A password da base foi guardada em `src/lib/db-url.ts` e commitada no repositório. Foi removida do código, **mas continua no histórico do Git**, portanto **muda a password no hPanel** (Bases de dados → Utilizador → Alterar password):

1. Gera uma password nova
2. Atualiza `DB_PASSWORD` no hPanel
3. Aguarda o deploy

Enquanto não o fizeres, a antiga password considera-se comprometida.

---

## 📞 Próximas Funcionalizações

Depois da base estar ligada, podes ativar:

1. **Stripe Payments**: Define `STRIPE_PUBLIC_KEY` e `STRIPE_SECRET_KEY`
2. **Email Notifications**: Define variáveis SMTP
3. **Uploads Directory Separado**: Aponta `UPLOADS_DIR` para fora do site (sobrevive a deploys)

---

Estás quase lá! 🎉 Falta apenas 5-10 minutos de configuração no hPanel.
