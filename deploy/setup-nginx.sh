#!/usr/bin/env bash
# Configure nginx + certificats Let's Encrypt pour les sites (à lancer avec sudo sur le VPS).
# Calqué sur pixelette.net : fichiers dans /home/iksaif/public_html/<domaine>, certbot en webroot, clé ECDSA.
# Idempotent : on peut le relancer sans risque.
#
#   sudo bash setup-ecoleprimaire.sh [domaine…]     (défaut : ecoleprimaire.app skoolik.app)
set -euo pipefail

RACINE=/home/iksaif/public_html
SITES=("$@")
[[ ${#SITES[@]} -eq 0 ]] && SITES=(ecoleprimaire.app skoolik.app)

[[ $EUID -eq 0 ]] || { echo "À lancer avec sudo" >&2; exit 1; }

recharger() { nginx -t && systemctl reload nginx; }

for d in "${SITES[@]}"; do
  racine="$RACINE/$d"
  conf="/etc/nginx/sites-available/$d"
  [[ -f "$racine/index.html" ]] || { echo "❌ $racine/index.html absent : déployer le site d'abord" >&2; exit 1; }

  if [[ ! -f "/etc/letsencrypt/live/$d/fullchain.pem" ]]; then
    echo "🔐 $d : configuration HTTP provisoire puis certificat"
    cat > "$conf" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $d www.$d;
    root $racine;
}
EOF
    ln -sf "$conf" "/etc/nginx/sites-enabled/$d"
    recharger
    certbot certonly --webroot -w "$racine" -d "$d" -d "www.$d" \
      --key-type ecdsa --non-interactive --agree-tos --keep-until-expiring
  fi

  echo "⚙️  $d : configuration finale"
  fmt="journal_${d//./_}"
  cat > "$conf" <<EOF
# Généré par deploy/setup-nginx.sh (dépôt ecole-primaire)

# Statistiques d'usage anonymes (voir src/utils/journal.js) : pas d'adresse IP, pas de cookie.
log_format $fmt escape=json '{"t":"\$time_iso8601","site":"\$host","q":"\$args","ua":"\$http_user_agent","ref":"\$http_referer"}';
server {
    listen 80;
    listen [::]:80;
    server_name $d www.$d;
    # renouvellement certbot (webroot)
    location /.well-known/acme-challenge/ { root $racine; }
    location / { return 301 https://$d\$request_uri; }
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name www.$d;
    ssl_certificate /etc/letsencrypt/live/$d/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$d/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    return 301 https://$d\$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name $d;

    root $racine;
    index index.html;
    charset utf-8;

    access_log /var/log/nginx/$d.access.log;
    error_log /var/log/nginx/$d.error.log;

    ssl_certificate /etc/letsencrypt/live/$d/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$d/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # .app impose déjà HTTPS (préchargement HSTS du domaine de premier niveau)
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), interest-cohort=()" always;
    # Pas de ressource externe sauf l'API Mistral (facultative) ; styles et scripts inline utilisés
    # par les pages statiques et les documents d'impression ; polices ajoutées depuis un fichier en data:
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: blob:; connect-src 'self' data: https://api.mistral.ai; frame-src 'self' about:; frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'" always;

    error_page 404 /404.html;

    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml application/xml;

    # signal de statistiques envoyé par l'app : journal dédié, sans IP
    location = /journal {
        access_log /var/log/nginx/$d.journal.log $fmt;
        return 204;
    }

    # fichiers Vite avec empreinte dans le nom
    location /assets/ {
        expires max;
        try_files \$uri =404;
    }
    # fiches PDF, aperçus et pages statiques
    location /telechargements/ {
        expires 1d;
        try_files \$uri \$uri/ =404;
    }
    # l'app utilise un routage par # : seules les vraies pages existent
    location / {
        expires -1;
        try_files \$uri \$uri/ =404;
    }
}
EOF
  ln -sf "$conf" "/etc/nginx/sites-enabled/$d"
  recharger
  echo "✅ https://$d"
done
