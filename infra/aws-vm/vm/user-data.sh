#!/bin/bash
set -euxo pipefail

# Amazon Linux 2023 bootstrap for Argus self-hosted VM.

dnf update -y
dnf install -y docker jq curl
# Compose v2 plugin (AL2023)
dnf install -y docker-compose-plugin || true
systemctl enable --now docker

# Fallback if package lacked compose plugin
if ! docker compose version >/dev/null 2>&1; then
  mkdir -p /usr/local/lib/docker/cli-plugins
  curl -fsSL "https://github.com/docker/compose/releases/download/v2.32.4/docker-compose-linux-x86_64" \
    -o /usr/local/lib/docker/cli-plugins/docker-compose
  chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
fi

TOKEN=$(curl -sX PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
REGION=$(curl -sH "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/placement/region)
PUBLIC_IP=$(curl -sH "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/public-ipv4 || true)
INSTANCE_ID=$(curl -sH "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-id)

mkdir -p /opt/argus
cd /opt/argus

if [[ ! -f /opt/argus/docker-compose.yml ]]; then
  echo "ERROR: /opt/argus/docker-compose.yml missing" >&2
  exit 1
fi

PUBLIC_URL="http://${PUBLIC_IP:-localhost}"
cat >/opt/argus/.env <<EOF
ARGUS_IMAGE=${ARGUS_IMAGE:-ghcr.io/rajkumar-madhu/argus:latest}
ARGUS_EXTERNAL_URL=${PUBLIC_URL}
EOF

docker compose -f /opt/argus/docker-compose.yml --env-file /opt/argus/.env pull || true
docker compose -f /opt/argus/docker-compose.yml --env-file /opt/argus/.env up -d

echo "argus-vm-bootstrap-complete instance=${INSTANCE_ID} region=${REGION} url=${PUBLIC_URL}" >/var/log/argus-bootstrap.log
