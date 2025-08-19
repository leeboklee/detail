#!/usr/bin/env bash
set -euo pipefail

# WSL2 Dev setup: systemd user service + Nginx reverse proxy

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || { echo "[$1] not found"; return 1; }
}

echo "[1/6] Ensuring directories"
mkdir -p "$HOME/.config/systemd/user"
sudo mkdir -p /opt/detail

REPO_WIN="/mnt/c/codist/detail"
if [ -d "$REPO_WIN" ]; then
  echo "[link] Linking $REPO_WIN -> /opt/detail"
  sudo rm -rf /opt/detail
  sudo ln -s "$REPO_WIN" /opt/detail
else
  echo "[warn] $REPO_WIN not found; keeping /opt/detail as-is"
fi

echo "[2/6] Installing packages (nginx, ufw, node if missing)"
sudo apt-get update -y
sudo apt-get install -y nginx ufw || true

echo "[3/6] Writing systemd user service for Next dev (3901)"
cat > "$HOME/.config/systemd/user/detail-dev.service" <<'UNIT'
[Unit]
Description=Detail Next.js Dev Server
After=network-online.target

[Service]
Type=simple
WorkingDirectory=/opt/detail
Environment=PORT=3901
Environment=NODE_ENV=development
ExecStart=/usr/bin/npm run dev --silent -- -p 3901
Restart=always
RestartSec=2

[Install]
WantedBy=default.target
UNIT

echo "[4/6] Configuring Nginx reverse proxy (127.0.0.1:3900 -> 127.0.0.1:3901)"
sudo tee /etc/nginx/sites-available/detail >/dev/null <<'NGINX'
server {
  listen 127.0.0.1:3900;
  server_name _;

  location / {
    proxy_pass http://127.0.0.1:3901;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/detail /etc/nginx/sites-enabled/detail
sudo nginx -t
sudo systemctl restart nginx

echo "[5/6] Enabling user lingering and starting service"
if command -v loginctl >/dev/null 2>&1; then
  sudo loginctl enable-linger "$USER" || true
fi

systemctl --user daemon-reload
systemctl --user enable --now detail-dev

echo "[6/6] Status"
systemctl --user status detail-dev --no-pager || true
ss -ltnp | grep 3901 || true
curl -s -o /dev/null -w "curl_to_nginx_http_code=%{http_code}\n" http://127.0.0.1:3900 || true

echo "Done. Access via Windows: http://localhost:3900"

