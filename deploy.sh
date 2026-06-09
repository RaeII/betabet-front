#!/usr/bin/env bash
set -euo pipefail

# Deploy na VPS: puxa as imagens mais recentes do GHCR e sobe os containers.
# Rode este script no diretório onde estão os arquivos compose
# (front-bolaoclt.yml e back-bolaoclt.yml).

FRONT_IMAGE="ghcr.io/raeii/betabet-front:latest"
BACK_IMAGE="ghcr.io/raeii/betabet:latest"

FRONT_COMPOSE="front-bolaoclt.yml"
BACK_COMPOSE="back-bolaoclt.yml"

log() { printf '\n\033[1;34m==> %s\033[0m\n' "$1"; }

log "Pull frontend: $FRONT_IMAGE"
docker pull "$FRONT_IMAGE"

log "Pull backend: $BACK_IMAGE"
docker pull "$BACK_IMAGE"

log "Subindo frontend (betabet-front)"
docker compose -f "$FRONT_COMPOSE" up -d --no-deps betabet-front

log "Subindo backend (rebuild + recreate)"
docker compose -f "$BACK_COMPOSE" up -d --build --force-recreate

# Remove apenas imagens dangling (camadas <none> que sobram ao atualizar o :latest).
# Imagens em uso por containers ativos NÃO são afetadas pelo prune.
log "Limpando imagens antigas (dangling)"
docker image prune -f

log "Deploy concluído."
