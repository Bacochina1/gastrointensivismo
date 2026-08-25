# Gastrointensivismo

Aplicação Next.js implantada na Cloudflare Workers com OpenNext, D1, Stripe e
Resend.

## Desenvolvimento local

1. Copie `.env.example` para `.dev.vars` e preencha somente com chaves de teste.
2. Instale as dependências com `npm install`.
3. Inicie com `npm run dev`.

Antes de publicar, rode:

```bash
npm test
npm run lint
npm run cf:build
```

O procedimento completo de produção está em [DEPLOY_CLOUDFLARE.md](./DEPLOY_CLOUDFLARE.md).

> Não use `.env` neste projeto. O OpenNext pode incorporar arquivos `.env` no
> bundle. Para desenvolvimento local, use `.dev.vars`; em produção, use secrets
> e bindings da Cloudflare.
