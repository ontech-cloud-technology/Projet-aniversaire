# Changelog

Tous les changements notables de ce projet seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère à [Semantic Versioning](https://semver.org/lang/fr/).

## [1.1.0] - 2024-11-15

### Ajouté
- Page de présentation administrative (`presentation-admin.html`)
- Système de conversion automatique PowerPoint en images PNG
- Scripts de conversion (`convert-pptx-to-slides.js`, `convert-pptx.sh`)
- Script d'installation automatique des dépendances (`install-and-convert.sh`)
- Documentation complète du système de présentation (`PRESENTATION_README.md`)
- Lien vers la présentation dans la sidebar admin
- Navigation au clavier pour la présentation (flèches, espace, ESC)

### Modifié
- `.gitignore` pour exclure les fichiers volumineux de présentation
- `package.json` avec nouveaux scripts npm pour la conversion

## [1.0.0] - 2024-01-XX

### Ajouté
- Système de gestion des anniversaires
- Système de messages entre élèves
- Système de progression (9 personnes consécutives)
- Système de vote pour les activités
- Système de réputation et de modération
- Filtre de mots interdits (200+ mots)
- Page d'acceptation des règles
- Gestion des profils d'élèves avec visibilité
- Système de tracking des fêtes pour les admins
- Envoi d'emails automatiques (SendGrid)
- Dashboard administrateur complet
- Système de logs d'activité

### Modifié
- Interface utilisateur améliorée
- Design responsive et moderne

### Sécurité
- Validation des messages avec filtrage de contenu
- Système de réputation pour maintenir un environnement respectueux
- Gestion des statuts utilisateurs (actif, bloqué, spectateur)

