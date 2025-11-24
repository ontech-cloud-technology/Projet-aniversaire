#!/bin/bash

# Script de déploiement automatique pour le serveur API Email
# Ce script prépare et déploie le serveur sur différentes plateformes

echo "🚀 Script de déploiement automatique - Serveur API Email"
echo "============================================================"
echo ""

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

echo "✅ Node.js détecté: $(node --version)"
echo ""

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
    echo "✅ Dépendances installées"
    echo ""
fi

# Vérifier si .env existe
if [ ! -f ".env" ]; then
    echo "⚠️  Fichier .env non trouvé. Création..."
    cat > .env << EOF
SENDGRID_API_KEY=votre_cle_api_sendgrid
SENDGRID_FROM_EMAIL=noreply@203celebrationhub.com
PORT=3001
EOF
    echo "✅ Fichier .env créé"
    echo ""
fi

echo "📋 Options de déploiement disponibles:"
echo ""
echo "1. 🟢 Render.com (Recommandé - Gratuit, pas de carte de crédit)"
echo "   → Suivez les instructions dans DEPLOIEMENT_RENDER.md"
echo ""
echo "2. 🔵 Railway.app (Gratuit avec crédits)"
echo "   → Installez Railway CLI: npm i -g @railway/cli"
echo "   → Puis: railway login && railway up"
echo ""
echo "3. 🟡 PM2 (Pour VPS/serveur dédié)"
echo "   → Installation: npm install -g pm2"
echo "   → Démarrage: pm2 start ecosystem.config.js"
echo "   → Sauvegarder: pm2 save && pm2 startup"
echo ""
echo "4. 🔴 Firebase Cloud Functions (Nécessite plan Blaze)"
echo "   → Vous devez activer le plan Blaze sur Firebase"
echo "   → Puis: firebase deploy --only functions"
echo ""

# Vérifier PM2
if command -v pm2 &> /dev/null; then
    echo "✅ PM2 est installé"
    echo ""
    read -p "Voulez-vous démarrer le serveur avec PM2 maintenant? (o/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Oo]$ ]]; then
        echo "🚀 Démarrage du serveur avec PM2..."
        pm2 start ecosystem.config.js
        pm2 save
        echo ""
        echo "✅ Serveur démarré avec PM2 !"
        echo "📊 Voir les logs: pm2 logs email-api"
        echo "🔄 Redémarrer: pm2 restart email-api"
        echo "⏹️  Arrêter: pm2 stop email-api"
    fi
else
    echo "💡 Pour démarrer automatiquement au boot, installez PM2:"
    echo "   npm install -g pm2"
    echo "   pm2 start ecosystem.config.js"
    echo "   pm2 save"
    echo "   pm2 startup"
    echo ""
fi

echo ""
echo "============================================================"
echo "📚 Documentation complète: DEPLOIEMENT.md"
echo "⚡ Guide rapide Render: DEPLOIEMENT_RENDER.md"
echo "============================================================"




