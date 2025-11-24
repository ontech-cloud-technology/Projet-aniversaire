#!/bin/bash

# Script pour démarrer l'API de conversion PPTX

echo "🚀 Démarrage de l'API de conversion PowerPoint..."

# Vérifier si Python 3 est installé
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 n'est pas installé"
    exit 1
fi

# Vérifier si les dépendances sont installées
if ! python3 -c "import flask" 2>/dev/null; then
    echo "⚠️  Les dépendances Python ne sont pas installées"
    echo "Installation des dépendances..."
    pip3 install -r requirements.txt
fi

# Vérifier les outils de conversion
echo "🔧 Vérification des outils de conversion..."
if command -v soffice &> /dev/null || command -v libreoffice &> /dev/null; then
    echo "✅ LibreOffice trouvé"
else
    echo "⚠️  LibreOffice non trouvé - nécessaire pour la conversion"
fi

if command -v pdftoppm &> /dev/null; then
    echo "✅ pdftoppm trouvé"
elif command -v convert &> /dev/null; then
    echo "✅ ImageMagick trouvé"
else
    echo "⚠️  Aucun outil PDF→PNG trouvé (pdftoppm ou ImageMagick)"
fi

# Démarrer l'API
echo ""
echo "🌐 Démarrage de l'API sur http://localhost:5000"
echo "Appuyez sur Ctrl+C pour arrêter"
echo ""

python3 convert-pptx.py


