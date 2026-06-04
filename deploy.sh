#!/bin/sh
set -e

echo "→ Pull des dernières modifications..."
git pull origin main

echo "→ Installation des dépendances..."
npm ci --omit=dev

echo "→ Build TypeScript..."
npm run build

echo "→ Redémarrage de l'application..."
pm2 restart comparator

echo "→ Déployé. URL du tunnel :"
pm2 logs tunnel --nostream --lines 30 2>/dev/null | grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' | tail -1
