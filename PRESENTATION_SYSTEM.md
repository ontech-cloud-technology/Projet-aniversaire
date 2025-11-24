# Système de Gestion des Présentations PowerPoint

Ce système permet de télécharger, convertir et présenter des fichiers PowerPoint via une interface web.

## Fonctionnalités

1. **Upload de présentations** : Téléchargez des fichiers PowerPoint (.pptx) vers Supabase Storage
2. **Conversion automatique** : Convertissez les PPTX en images PNG (une image par slide)
3. **Gestion multiple** : Gérez plusieurs présentations avec des noms uniques
4. **Présentation** : Lancez une présentation en mode plein écran avec navigation

## Configuration

### 1. Créer le bucket Supabase

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Allez dans "Storage" dans le menu de gauche
4. Cliquez sur "New bucket"
5. Nom du bucket : `presentations`
6. ✅ Cochez "Public bucket"
7. Cliquez sur "Create bucket"

### 2. Configurer les Policies RLS

1. Cliquez sur le bucket `presentations`
2. Allez dans l'onglet "Policies"
3. Créez les policies suivantes :

**Policy 1 - INSERT (Upload)**
- Nom : "Allow public uploads"
- Operation : INSERT
- Policy definition : `true`

**Policy 2 - SELECT (Lecture)**
- Nom : "Allow public read"
- Operation : SELECT
- Policy definition : `true`

**Policy 3 - UPDATE (Mise à jour)**
- Nom : "Allow public update"
- Operation : UPDATE
- Policy definition : `true`

### 3. Installer les dépendances Python

```bash
cd api
pip install -r requirements.txt
```

### 4. Installer les outils de conversion

**Sur macOS :**
```bash
# LibreOffice (pour convertir PPTX en PDF)
brew install --cask libreoffice

# Poppler (pour convertir PDF en images)
brew install poppler
```

**Sur Linux (Ubuntu/Debian) :**
```bash
sudo apt-get update
sudo apt-get install libreoffice poppler-utils
```

**Alternative : Python pdf2image**
```bash
pip install pdf2image
# Sur macOS, installer aussi poppler :
brew install poppler
```

### 5. Démarrer l'API de conversion

```bash
cd api
python convert-pptx.py
```

L'API sera accessible sur `http://localhost:5000`

**Note :** Si vous déployez sur un serveur, modifiez l'URL dans `presentation-admin.html` :
```javascript
const API_URL = 'http://votre-serveur:5000';
```

## Utilisation

1. Ouvrez `presentation-admin.html` dans votre navigateur
2. **Télécharger une présentation** :
   - Entrez un nom pour la présentation
   - Glissez-déposez ou sélectionnez un fichier .pptx
   - Cliquez sur "Télécharger vers Supabase"

3. **Convertir en images** :
   - Sélectionnez une présentation dans la liste
   - Cliquez sur "Convertir en Images"
   - Attendez que la conversion se termine (message "Prêt à être utilisé")

4. **Lancer une présentation** :
   - Sélectionnez une présentation convertie dans le menu déroulant
   - Cliquez sur "Lancer la Présentation"
   - Entrez le code d'accès : `203ADMIN2024`
   - Utilisez les flèches ← → pour naviguer

## Structure des fichiers dans Supabase

```
presentations/
├── pptx/
│   ├── nom-presentation-1234567890.pptx
│   └── autre-presentation-1234567891.pptx
└── slides/
    ├── nom-presentation/
    │   ├── slide-1.png
    │   ├── slide-2.png
    │   └── ...
    └── autre-presentation/
        ├── slide-1.png
        └── ...
```

Chaque présentation a un nom unique qui est utilisé pour organiser les fichiers. Les slides sont stockées dans un dossier séparé par présentation.

## Dépannage

### L'API ne répond pas
- Vérifiez que l'API est démarrée : `python api/convert-pptx.py`
- Vérifiez que le port 5000 n'est pas utilisé par un autre service
- Modifiez le port dans `convert-pptx.py` si nécessaire

### Erreur "Bucket not found"
- Vérifiez que le bucket `presentations` existe dans Supabase
- Vérifiez que les policies RLS sont configurées

### Erreur de conversion
- Vérifiez que LibreOffice est installé : `which soffice` ou `which libreoffice`
- Vérifiez que pdftoppm ou ImageMagick est installé
- Consultez les logs de l'API pour plus de détails

### Les slides ne s'affichent pas
- Vérifiez que la conversion s'est terminée avec succès
- Vérifiez que les images sont bien dans Supabase Storage
- Vérifiez les permissions du bucket (doit être public)

## Code d'accès

Le code d'accès par défaut est `203ADMIN2024`. Pour le modifier, changez la constante `ADMIN_ACCESS_CODE` dans `presentation-admin.html`.


