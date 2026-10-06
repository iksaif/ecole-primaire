#!/usr/bin/env bash
# Construit les sites et les envoie sur le VPS avec rsync (SSH).
#
#   scripts/deploiement/deploy-vps.sh                 # tous les sites de DEPLOY_SITES
#   scripts/deploiement/deploy-vps.sh skoolik         # un seul site
#   scripts/deploiement/deploy-vps.sh --dry-run       # montre ce qui serait envoyé, sans rien modifier
#   scripts/deploiement/deploy-vps.sh --no-build      # envoie les dist-* déjà construits
# (ou `npm run deploy:vps -- <options>`). La construction d'un site est `npm run build:<site>` (vite build, fiches, pages statiques).
#
# Configuration (non commitée) : .deploy.env à la racine — voir .deploy.env.example. L'hôte SSH n'est que là.
set -euo pipefail
cd "$(dirname "$0")/../.."

if [[ ! -f .deploy.env ]]; then
  echo "❌ .deploy.env manquant : cp .deploy.env.example .deploy.env puis adapter" >&2
  exit 1
fi
# shellcheck disable=SC1091
source .deploy.env
: "${DEPLOY_HOST:?DEPLOY_HOST manquant dans .deploy.env}"
: "${DEPLOY_ROOT:?DEPLOY_ROOT manquant dans .deploy.env}"
DEPLOY_SITES="${DEPLOY_SITES:-ecoleprimaire skoolik}"
SSH_OPTS="${DEPLOY_SSH_OPTS:-}"

DRY=()
BUILD=1
SITES=()
for a in "$@"; do
  case "$a" in
    --dry-run|-n) DRY=(--dry-run) ;;
    --no-build) BUILD=0 ;;
    -*) echo "Option inconnue : $a" >&2; exit 1 ;;
    *) SITES+=("$a") ;;
  esac
done
[[ ${#SITES[@]} -eq 0 ]] && read -r -a SITES <<< "$DEPLOY_SITES"

# Domaine de chaque site : variable DOMAINE_<site> de .deploy.env, sinon <site>.app
domaine() { local v="DOMAINE_$1"; echo "${!v:-$1.app}"; }

for s in "${SITES[@]}"; do
  [[ -f ".env.$s" ]] || { echo "❌ Site inconnu : $s (pas de .env.$s)" >&2; exit 1; }
  if [[ $BUILD -eq 1 ]]; then
    echo "🔨 Construction de $s…"
    npm run --silent "build:$s"
  fi
  [[ -f "dist-$s/index.html" ]] || { echo "❌ dist-$s/ absent" >&2; exit 1; }

  cible="$DEPLOY_ROOT/$(domaine "$s")"
  echo "🚀 $s → $DEPLOY_HOST:$cible"
  if [[ ${#DRY[@]} -eq 0 ]]; then
    # shellcheck disable=SC2086
    ssh $SSH_OPTS "$DEPLOY_HOST" "mkdir -p '$cible'"
  fi
  # --delay-updates : les fichiers sont remplacés à la fin du transfert (pas de site à moitié à jour).
  # Options compatibles avec le rsync de macOS (openrsync) comme avec GNU rsync.
  rsync -az --delete --delay-updates --itemize-changes "${DRY[@]}" \
    -e "ssh $SSH_OPTS" "dist-$s/" "$DEPLOY_HOST:$cible/"
done
echo "✅ Terminé"
