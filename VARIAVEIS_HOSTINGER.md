# Variáveis de ambiente a definir no painel Hostinger

O site compila, mas o NextAuth falha porque **nenhuma variável de ambiente está
definida no servidor**. O ficheiro `.env.production` está no `.gitignore`, por
isso não vai para o servidor — os valores têm de ser definidos no painel.

## Obrigatórias

| Variável | Valor |
|---|---|
| `NEXTAUTH_URL` | `https://green-toad-192382.hostingersite.com` |
| `NEXTAUTH_SECRET` | gerar com `openssl rand -base64 32` |
| `DATABASE_URL` | `postgresql://UTILIZADOR:PASSWORD@HOST:5432/BASEDADOS` |
| `NODE_ENV` | `production` |

O `NEXTAUTH_URL` tem de ser **exactamente** o domínio pelo qual acedes ao site,
com `https://` e sem barra no fim. Se mudares de domínio mais tarde, actualiza
esta variável também.

## Opcionais

Podem ficar vazias — o código já lida com a ausência delas:

`STRIPE_PUBLIC_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SENDGRID_API_KEY`, `ADMIN_EMAIL`

Se `GOOGLE_CLIENT_ID` estiver vazia, o botão de login com Google simplesmente
não aparece.

## Depois de definir as variáveis

1. Redeploy da aplicação
2. Abrir `https://green-toad-192382.hostingersite.com/api/health`
3. Criar as tabelas: `npx prisma migrate deploy`
4. Popular dados de teste: `npm run prisma:seed`

## Diagnóstico

O endpoint `/api/health` mostra que variáveis faltam e se a base de dados
responde. Nunca mostra o valor dos segredos, apenas se estão definidos.

Resposta esperada quando tudo está bem:

```json
{
  "status": "ok",
  "database": "ligada (3 utilizadores)",
  "problems": []
}
```
