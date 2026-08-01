# Base de dados MySQL — Hostinger

O projecto foi convertido de PostgreSQL para MySQL.

## Variável DATABASE_URL

No painel Hostinger, define:

```
DATABASE_URL = mysql://UTILIZADOR:PASSWORD@localhost:3306/NOME_DA_BD
```

Com os dados criados:

- Utilizador: `u128759105_SEXFR`
- Base de dados: `u128759105_SEX`
- Host: `localhost` (se o painel indicar outro host, usa esse)
- Porta: `3306`

### Atenção: caracteres especiais na password

A password tem de ser codificada para URL, senão a ligação falha.
Substituições necessárias:

| Caractere | Codificação |
|---|---|
| `@` | `%40` |
| `+` | `%2B` |
| `&` | `%26` |
| `#` | `%23` |
| `/` | `%2F` |
| `:` | `%3A` |
| `?` | `%3F` |

Exemplo genérico: uma password como `X+&123@z` fica `X%2B%26123%40z` dentro do URL.

> Nunca escrevas a tua password real em ficheiros do repositório — fica
> guardada para sempre no histórico do Git. Usa apenas as variáveis de
> ambiente do painel da Hostinger.

## Criar as tabelas

Depois de definir `DATABASE_URL` e fazer o deploy, corre uma vez:

```bash
npx prisma db push
```

O `db push` cria as tabelas directamente a partir do schema, sem precisar de
ficheiros de migração. É o mais adequado aqui porque o projecto ainda não tem
pasta `prisma/migrations`.

Para inserir os utilizadores de teste:

```bash
npm run prisma:seed
```

## Verificar

Abre `/api/health` no browser. Deve responder:

```json
{ "status": "ok", "database": "ligada (3 utilizadores)", "problems": [] }
```

## O que mudou no código

| Antes (PostgreSQL) | Agora (MySQL) |
|---|---|
| `provider = "postgresql"` | `provider = "mysql"` |
| `interests String[]` | `interests Json?` |

O MySQL não suporta arrays nativos. O campo `interests` passou a ser JSON e o
ficheiro `src/lib/interests.ts` converte-o em `string[]` na fronteira da API,
por isso o frontend não precisou de alterações.

## Segurança

Não guardes a password em ficheiros do repositório. Define-a apenas nas
variáveis de ambiente do painel.
