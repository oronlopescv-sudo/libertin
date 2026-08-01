# 🚀 GUIA RÁPIDO - Corrigir Tudo em 2 Minutos

## ❌ PROBLEMA
```
DATABASE_URL not found
Site ainda mostra "RencontresPremium"
```

---

## ✅ SOLUÇÃO (3 PASSOS)

### PASSO 1: Configurar Variáveis de Ambiente (1 min)

**Via hPanel Hostinger:**

1. Ir para: https://hpanel.hostinger.com
2. Login com suas credenciais
3. Selecionar seu site: `green-toad-192382`
4. Procurar "Environment Variables" ou "Configurações"
5. **Adicionar estas 4 variáveis:**

```
NEXTAUTH_URL = https://green-toad-192382.hostingersite.com
NEXTAUTH_SECRET = gerar-com: openssl rand -base64 32
DATABASE_URL = mysql://u128759105:SENHA@localhost:3306/u128759105_SEX
NODE_ENV = production
```

**Onde pegar DATABASE_URL:**
- No hPanel, ir em "Banco de Dados" → `u128759105_SEX`
- Copiar: Usuário, Senha, Host
- Exemplo final: `mysql://u128759105:minhaSenha123@localhost:3306/u128759105_SEX`

---

### PASSO 2: Fazer Git Pull (30 seg)

Via SSH ou Hostinger File Manager:

```bash
cd /seu/diretorio/libertin
git pull origin main
npm run build
npm start
```

Ou usando script de deploy:
```bash
node scripts/deploy-hostinger.js
```

---

### PASSO 3: Testar (30 seg)

Abrir no navegador:
```
https://green-toad-192382.hostingersite.com/register
```

Verificar:
- ✅ Logo mostra "Libertinelover" (não "RencontresPremium")
- ✅ Formulário carrega sem erros
- ✅ Botão "Criar le compte" funciona
- ✅ Nenhuma mensagem de DATABASE_URL

---

## 🔐 GERAR NEXTAUTH_SECRET

Terminal (bash/Mac/Linux):
```bash
openssl rand -base64 32
```

Ou online: https://generate-secret.now.sh/

Resultado: algo como `Wx9hY2R5Z3RyNDMyMTkzMjEwNDMyMQ==`

---

## 🐛 SE DER ERRO

| Erro | Solução |
|------|---------|
| DATABASE_URL not found | Faltou adicionar no hPanel |
| Connection refused | IP/senha do banco errada |
| Unknown database | Nome do banco errado |
| RencontresPremium ainda | Fazer git pull e npm run build |

---

## 📱 VERIFICAR RESULTADO

Depois de tudo configurado:

1. Abrir: `https://green-toad-192382.hostingersite.com`
2. Clicar em "Créer le compte"
3. Preencher formulário
4. Deve funcionar 100%!

---

## ✨ PRONTO!

Site deve estar funcionando com:
- ✅ Nome "Libertinelover"
- ✅ Banco de dados conectado
- ✅ Registro de usuários funcionando
- ✅ 5 planos de preço disponíveis

Próximo: Integrar com Stripe para receber pagamentos! 💳

---

**Tempo total**: ~2 minutos  
**Dificuldade**: ⭐ Muito fácil
