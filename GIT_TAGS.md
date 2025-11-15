# Système de Tags Git - Fête Express

Ce document explique comment utiliser le système de tags Git pour gérer les versions du projet.

## 📋 Vue d'ensemble

Le projet utilise le **versioning sémantique** (Semantic Versioning) avec le format `MAJOR.MINOR.PATCH`:
- **MAJOR**: Changements incompatibles avec les versions précédentes
- **MINOR**: Nouvelles fonctionnalités rétrocompatibles
- **PATCH**: Corrections de bugs rétrocompatibles

## 🚀 Utilisation rapide

### Créer un tag automatiquement

Le script `create-tag.sh` facilite la création de tags:

```bash
# Pour une version patch (1.0.0 -> 1.0.1)
./create-tag.sh patch "Correction de bugs"

# Pour une version minor (1.0.0 -> 1.1.0)
./create-tag.sh minor "Nouvelles fonctionnalités"

# Pour une version major (1.0.0 -> 2.0.0)
./create-tag.sh major "Refonte majeure"
```

### Rendre le script exécutable

```bash
chmod +x create-tag.sh
```

## 📝 Processus complet

### 1. Créer un tag

```bash
# Option 1: Utiliser le script (recommandé)
./create-tag.sh patch "Description des changements"

# Option 2: Manuellement
# 1. Mettre à jour VERSION
echo "1.0.1" > VERSION

# 2. Commiter le changement
git add VERSION
git commit -m "Bump version to 1.0.1"

# 3. Créer le tag
git tag -a v1.0.1 -m "Version 1.0.1 - Description"

# 4. Pousser vers GitHub
git push origin v1.0.1
```

### 2. Pousser le tag vers GitHub

```bash
# Pousser un tag spécifique
git push origin v1.0.1

# Pousser tous les tags
git push --tags
```

### 3. Créer une release sur GitHub

1. Aller sur GitHub → Repository → Releases
2. Cliquer sur "Draft a new release"
3. Sélectionner le tag créé (ex: `v1.0.1`)
4. Ajouter un titre et une description
5. Publier la release

## 📚 Commandes Git utiles

### Lister les tags

```bash
# Liste tous les tags
git tag

# Liste les tags avec messages
git tag -n

# Filtrer les tags (ex: v1.x)
git tag -l "v1.*"
```

### Voir les détails d'un tag

```bash
git show v1.0.1
```

### Supprimer un tag

```bash
# Localement
git tag -d v1.0.1

# Sur GitHub (après suppression locale)
git push origin :refs/tags/v1.0.1
```

### Vérifier la version actuelle

```bash
cat VERSION
```

## 📖 Mise à jour du CHANGELOG

Avant de créer un tag, mettez à jour `CHANGELOG.md` avec les changements de cette version:

```markdown
## [1.0.1] - 2024-01-XX

### Corrigé
- Bug dans le système de réputation
- Problème d'affichage des messages

### Ajouté
- Nouvelle fonctionnalité X
```

## 🔄 Workflow recommandé

1. **Développer** les fonctionnalités/corrections
2. **Tester** les changements
3. **Mettre à jour** `CHANGELOG.md`
4. **Créer le tag** avec `./create-tag.sh`
5. **Pousser** le tag vers GitHub
6. **Créer une release** sur GitHub (optionnel mais recommandé)

## 📌 Exemples de messages de tag

### Version patch
```
Correction de bugs et améliorations mineures
```

### Version minor
```
Ajout du système de réputation et de modération
```

### Version major
```
Refonte complète de l'interface et nouvelle architecture
```

## ⚠️ Bonnes pratiques

1. **Toujours** mettre à jour `CHANGELOG.md` avant de créer un tag
2. **Tester** avant de créer un tag
3. **Créer des tags** uniquement sur la branche `main` ou `master`
4. **Utiliser des messages** descriptifs pour les tags
5. **Créer des releases** sur GitHub pour les versions importantes

## 🔗 Ressources

- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Git Tags Documentation](https://git-scm.com/book/en/v2/Git-Basics-Tagging)

