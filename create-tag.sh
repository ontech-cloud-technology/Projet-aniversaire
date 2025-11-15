#!/bin/bash

# Script pour créer un tag Git avec versioning sémantique
# Usage: ./create-tag.sh [major|minor|patch] [message]

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Lire la version actuelle
if [ ! -f VERSION ]; then
    echo -e "${RED}Erreur: Fichier VERSION introuvable${NC}"
    exit 1
fi

CURRENT_VERSION=$(cat VERSION)
echo -e "${BLUE}Version actuelle: ${CURRENT_VERSION}${NC}"

# Parser la version (format: MAJOR.MINOR.PATCH)
IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR=${VERSION_PARTS[0]}
MINOR=${VERSION_PARTS[1]}
PATCH=${VERSION_PARTS[2]}

# Déterminer le type de version
VERSION_TYPE=${1:-patch}

case $VERSION_TYPE in
    major)
        MAJOR=$((MAJOR + 1))
        MINOR=0
        PATCH=0
        ;;
    minor)
        MINOR=$((MINOR + 1))
        PATCH=0
        ;;
    patch)
        PATCH=$((PATCH + 1))
        ;;
    *)
        echo -e "${RED}Erreur: Type de version invalide. Utilisez: major, minor ou patch${NC}"
        exit 1
        ;;
esac

NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"
echo -e "${GREEN}Nouvelle version: ${NEW_VERSION}${NC}"

# Demander un message de tag
if [ -z "$2" ]; then
    echo -e "${YELLOW}Entrez un message pour ce tag (ou appuyez sur Entrée pour utiliser le message par défaut):${NC}"
    read -r TAG_MESSAGE
    if [ -z "$TAG_MESSAGE" ]; then
        TAG_MESSAGE="Version ${NEW_VERSION}"
    fi
else
    TAG_MESSAGE="$2"
fi

# Vérifier que nous sommes sur la branche main/master
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    echo -e "${YELLOW}Attention: Vous n'êtes pas sur la branche main/master (actuellement sur: ${CURRENT_BRANCH})${NC}"
    read -p "Continuer quand même? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Vérifier que le dépôt est propre
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${RED}Erreur: Le dépôt contient des modifications non commitées${NC}"
    echo "Voulez-vous les commiter maintenant? (y/N)"
    read -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        git commit -m "Changements avant tag ${NEW_VERSION}"
    else
        exit 1
    fi
fi

# Mettre à jour le fichier VERSION
echo "$NEW_VERSION" > VERSION
git add VERSION

# Créer un commit pour la nouvelle version
git commit -m "Bump version to ${NEW_VERSION}" || true

# Créer le tag
TAG_NAME="v${NEW_VERSION}"
echo -e "${BLUE}Création du tag: ${TAG_NAME}${NC}"
git tag -a "$TAG_NAME" -m "$TAG_MESSAGE"

# Afficher un résumé
echo -e "${GREEN}✓ Tag créé avec succès!${NC}"
echo -e "${BLUE}Tag: ${TAG_NAME}${NC}"
echo -e "${BLUE}Message: ${TAG_MESSAGE}${NC}"
echo ""
echo -e "${YELLOW}Pour pousser le tag vers GitHub, exécutez:${NC}"
echo -e "  ${GREEN}git push origin ${TAG_NAME}${NC}"
echo ""
echo -e "${YELLOW}Ou pour pousser tous les tags:${NC}"
echo -e "  ${GREEN}git push --tags${NC}"

