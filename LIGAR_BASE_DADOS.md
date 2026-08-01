# 🔌 Ligar o site à base de dados

Diagnóstico feito em produção (`/api/health`): **nenhuma variável de
ambiente está definida** no servidor. É por isso que o registo, o login e
todos os dados falham — o código está correto, falta a configuração.

```
ligacao:         nenhuma
database:        ERRO DE LIGAÇÃO
NEXTAUTH_URL:    EM FALTA
NEXTAUTH_SECRET: EM FALTA
```

---

## Passo 1 — Obter as credenciais da base

No hPanel da Hostinger: **Bases de dados → MySQL**.
Anota quatro valores da tua base (algo como `u128759105_SEX`):

| Campo | Onde aparece |
|---|---|
| Host | normalmente `localhost` |
| Nome da base | ex.: `u128759105_SEX` |
| Utilizador | ex.: `u128759105_SEXFR` |
| Password | a que definiste ao criar a base |

---

## Passo 2 — Definir as variáveis de ambiente

No hPanel: **o teu site → Configurações → Variáveis de ambiente**.

Usa a **forma com campos separados**. É a mais segura: passwords com
caracteres especiais (`@ + & # / : ?`) partem o `DATABASE_URL` se não
forem codificadas, e o erro que daí resulta não ajuda nada.

```
DB_HOST     = localhost
DB_PORT     = 3306
DB_USER     = (o teu utilizador)
DB_PASSWORD = (a tua password, tal como é, sem codificar)
DB_NAME     = (o nome da base)

NEXTAUTH_URL    = https://green-toad-192382.hostingersite.com
NEXTAUTH_SECRET = (gerar — ver abaixo)
NODE_ENV        = production

ADMIN_EMAILS = oronlopescv@gmail.com
```

### Gerar o NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

Gera o teu próprio e guarda-o. Se mudares este valor mais tarde, todas as
sessões abertas são invalidadas e os utilizadores têm de entrar de novo.

### Alternativa: URL completo

Se preferires uma só variável, a password **tem** de vir codificada:

```
DATABASE_URL = mysql://utilizador:pass%40word@localhost:3306/nome_da_base
```

| Caractere | Escreve-se |
|---|---|
| `@` | `%40` |
| `+` | `%2B` |
| `&` | `%26` |
| `#` | `%23` |
| `/` | `%2F` |

Se as duas formas estiverem presentes, os campos separados têm prioridade.

---

## Passo 3 — Criar as tabelas e fazer deploy

O script de deploy já trata disto (aplica as migrações e insere as
formulas de abonnement):

```bash
node scripts/deploy-hostinger.js
```

Ou, manualmente:

```bash
npm install
npx prisma migrate deploy
npx tsx prisma/seed-pricing.ts
npm run build
npm start
```

---

## Passo 4 — Confirmar

Autentica-te com o email que puseste em `ADMIN_EMAILS` e abre:

```
https://green-toad-192382.hostingersite.com/api/health
```

Deve mostrar `status: ok` e `database: ligada (N utilizadores)`.

Sem sessão de administrador, o endpoint devolve apenas `{"status":"ok"}` —
é intencional: antes expunha publicamente quais variáveis existiam, o
estado da base e o número de utilizadores.

---

## ⚠️ Segurança — ação necessária

A password da base estava escrita em `src/lib/db-url.ts` e commitada no
repositório. Foi removida do código, **mas continua no histórico do Git**,
e o histórico é visível a quem tiver acesso ao repositório.

**Muda a password da base no hPanel** (Bases de dados → utilizador →
alterar password) e atualiza `DB_PASSWORD` nas variáveis de ambiente.
Enquanto não o fizeres, considera essa password comprometida.
