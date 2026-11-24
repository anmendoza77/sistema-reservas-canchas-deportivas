#!/bin/bash
# Se ejecuta una sola vez al crear la instancia EC2 (Amazon Linux 2023).
dnf install -y nodejs git

git clone --branch dev https://github.com/anmendoza77/sistema-reservas-canchas-deportivas.git /opt/app
cd /opt/app/api
npm install --omit=dev

# La API corre como servicio: arranca sola y se reinicia si falla.
cat > /etc/systemd/system/reservas-api.service <<'EOF'
[Unit]
Description=API de reservas de canchas
After=network.target

[Service]
WorkingDirectory=/opt/app/api
Environment=PORT=80
Environment=FRONT_URL=http://cuc-bp-mendoza-sitio-2026.s3-website-us-east-1.amazonaws.com
ExecStart=/usr/bin/node src/servidor.js
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now reservas-api