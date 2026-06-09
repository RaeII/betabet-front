#!/usr/bin/env bash
set -euo pipefail

# Build e push das imagens Docker (frontend + backend) para o GHCR.

FRONT_DIR="/var/www/betabet-front"
BACK_DIR="/var/www/betabet"

FRONT_IMAGE="ghcr.io/raeii/betabet-front:latest"
BACK_IMAGE="ghcr.io/raeii/betabet:latest"

log() { printf '\n\033[1;34m==> %s\033[0m\n' "$1"; }

log "Build frontend: $FRONT_IMAGE"
docker build -t "$FRONT_IMAGE" "$FRONT_DIR"

log "Push frontend: $FRONT_IMAGE"
docker push "$FRONT_IMAGE"

log "Build backend: $BACK_IMAGE"
docker build -t "$BACK_IMAGE" "$BACK_DIR"

log "Push backend: $BACK_IMAGE"
docker push "$BACK_IMAGE"

log "Concluído com sucesso."
