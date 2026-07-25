# Estado das funcionalidades

Auditoria feita a cada página, botão e chamada à API.

## Verificado automaticamente

- **14 páginas** e **16 rotas de API** — todos os links internos e todas as
  chamadas `fetch()` apontam para destinos que existem. Zero links partidos.
- **Todos os botões têm handler** (`onClick` ou `type="submit"`). Nenhum botão
  morto.

## Corrigido nesta ronda

| Problema | Estado anterior | Agora |
|---|---|---|
| Registo | Redirigia para `/verify-email`, que prometia um email que nunca era enviado — beco sem saída | Login automático e entrada directa em `/decouvrir` |
| Recuperação de password | O token era criado mas só aparecia nos logs do servidor | Email enviado por SMTP com link válido 1 hora |
| Email de boas-vindas | Não existia (`TODO`) | Enviado após o registo, sem nunca bloquear a criação da conta |
| Botão de pagamento | Sem chave Stripe real, dava erro 500 sem explicação | Mensagem clara ao utilizador (503) |

## Depende de configuração

Estas funcionalidades estão implementadas mas precisam de variáveis de
ambiente para funcionarem em produção:

### Email (recuperação de password e boas-vindas)

```
SMTP_HOST     = smtp.hostinger.com
SMTP_PORT     = 465
SMTP_USER     = contact@teu-dominio.com
SMTP_PASSWORD = password dessa conta de email
SMTP_FROM     = contact@teu-dominio.com   (opcional)
```

Sem isto o resto do site funciona na mesma; apenas a recuperação de password
não envia email (o link fica registado nos logs do servidor, para envio
manual pelo administrador).

### Pagamentos

```
STRIPE_SECRET_KEY     = sk_live_... ou sk_test_...
STRIPE_PUBLIC_KEY     = pk_live_... ou pk_test_...
STRIPE_WEBHOOK_SECRET = whsec_...
```

Enquanto não estiverem definidas, o botão "Acheter" mostra uma mensagem a
explicar que o pagamento ainda não está activo, em vez de falhar sem
explicação.

### Login com Google (opcional)

```
GOOGLE_CLIENT_ID     = ...
GOOGLE_CLIENT_SECRET = ...
```

Se estiverem vazias, o botão de Google simplesmente não aparece.

## Diagnóstico

`/api/health` mostra o estado de tudo: variáveis em falta, ligação à base de
dados e se o email está activo.

## Upload de fotos

Grava em `public/uploads/`. Confirma que essa pasta tem permissão de escrita
no servidor, senão o upload falha.
