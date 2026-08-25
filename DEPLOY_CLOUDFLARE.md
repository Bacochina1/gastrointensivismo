# Deploy seguro na Cloudflare

Este projeto usa **Cloudflare Workers + OpenNext**. O adaptador antigo
`@cloudflare/next-on-pages` não faz mais parte do projeto.

## 1. Rotacione as credenciais antigas

Chaves Stripe e Resend já estiveram no código/histórico do repositório. Antes do
deploy, revogue-as nos respectivos painéis e crie chaves novas. Não reutilize as
antigas, mesmo que o repositório seja privado.

## 2. Valide o projeto

Use Node.js 20.9 ou superior:

```bash
npm install
npm test
npm run lint
npm run cf:build
```

## 3. Autentique o Wrangler

```bash
npx wrangler login
npx wrangler whoami
```

## 4. Atualize o banco D1

Para um banco que já possui as tabelas `Users` e `Progress`, execute uma vez:

```bash
npm run d1:migrate-remote
```

Para um banco totalmente vazio, use `npm run d1:init-remote` no lugar da
migração. Não execute os dois comandos no mesmo banco novo.

## 5. Faça o primeiro deploy do Worker

```bash
npm run cf:deploy
```

Guarde a URL `workers.dev` exibida no final.

## 6. Cadastre bindings e secrets

Execute cada comando e cole o valor novo somente quando o Wrangler solicitar:

```bash
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_PRICE_ID
npx wrangler secret put NEXTAUTH_SECRET
npx wrangler secret put NEXTAUTH_URL
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put RESEND_FROM_EMAIL
```

Use a URL pública do Worker em `NEXTAUTH_URL`. Gere `NEXTAUTH_SECRET` com:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Não configure `ALLOW_INSECURE_DEV_AUTH` em produção.

Depois de salvar os secrets, publique novamente para garantir que o código e a
configuração estejam na mesma versão:

```bash
npm run cf:deploy
```

## 7. Configure o webhook da Stripe

No painel Stripe, crie um endpoint apontando para:

```text
https://SEU-WORKER/api/webhooks/stripe
```

Selecione estes eventos:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `charge.refunded`
- `charge.dispute.created`
- `customer.subscription.deleted`

Copie o signing secret `whsec_...` do endpoint para
`STRIPE_WEBHOOK_SECRET` executando:

```bash
npx wrangler secret put STRIPE_WEBHOOK_SECRET
```

Se ele mudar, execute o mesmo comando novamente.

## 8. Teste depois do deploy

1. Abra a página inicial.
2. Clique no botão de compra usando o modo de teste Stripe.
3. Confirme no Stripe que o webhook retornou HTTP 200.
4. Confirme no D1 que o usuário recebeu `has_access = 1`.
5. Faça login e confirme que `/aluno` abre e salva progresso.

O deploy correto é o Worker produzido por `npm run cf:deploy`. Apenas executar
`git push` para o projeto antigo do Cloudflare Pages não publica esta nova
arquitetura.
