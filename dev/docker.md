# Docker - betabet front

## Build e push (máquina local)

```bash
docker build -t ghcr.io/raeii/betabet-front:latest .
docker push ghcr.io/raeii/betabet-front:latest
```

```bash
docker pull ghcr.io/raeii/betabet-front:latest
docker compose -f front-bolaoclt.yml up -d --no-deps betabet-front
```

## Logs (VPS)

```bash
docker compose -f front-bolaoclt.yml logs -f betabet-front
```

## Imagem

```bash
ghcr.io/raeii/betabet-front:latest
```

## Arquitetura

- Local continua usando `bun run dev`.
- Produção usa build estático do Vite servido por Nginx.
- O browser chama `/api/...` no mesmo domínio do front.
- O Nginx do container encaminha `/api` para `API_UPSTREAM`.
- A porta pública padrão do front é `4501`.

## Variáveis

```bash
FRONT_PORT=4501
API_UPSTREAM=http://host.docker.internal:3000
```

Use `API_UPSTREAM=http://host.docker.internal:3000` quando o backend estiver publicado na porta `3000` do host da VPS, como no compose atual do backend.

Não use barra final em `API_UPSTREAM`; o proxy precisa preservar o prefixo `/api`.

Se front e backend ficarem na mesma rede Docker, use o nome do serviço/container do backend, por exemplo:

```bash
API_UPSTREAM=http://bolaoclt-api:3000
```

## Login no GHCR (uma vez por máquina)

```bash
echo $GITHUB_TOKEN | docker login ghcr.io -u raeii --password-stdin
```

## Verificação rápida

```bash
curl -i http://localhost:4501/health
curl -i http://localhost:4501/
curl -i http://localhost:4501/api/system/health
```

## Observações de produção

- O backend ainda deve permitir a origem pública do front em `CORS_ORIGINS`, por exemplo `https://seudominio.com`.
- Como o backend usa cookies seguros em produção, publique o domínio final via HTTPS no proxy externo da VPS.
- Não configure URL absoluta da API no build do front para produção; manter `/api` preserva cookies same-origin e evita CORS desnecessário no browser.
