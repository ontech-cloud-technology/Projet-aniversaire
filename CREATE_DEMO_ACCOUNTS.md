# Créer les Comptes de Démonstration

## Comptes à créer

1. **demo1@onteech.com**
   - Mot de passe: `123456`
   - Rôle: `eleve`
   - Type: `standard`
   - Date d'anniversaire: `2 décembre 2012` (2012-12-02)

2. **demo2@ontech.com**
   - Mot de passe: `123456`
   - Rôle: `eleve`
   - Type: `standard`
   - Date d'anniversaire: `3 décembre 2012` (2012-12-03)

## Méthode 1: Via l'interface super-admin.html (Recommandé)

1. Ouvrez `super-admin.html` dans votre navigateur
2. Connectez-vous en tant qu'administrateur
3. Cliquez sur "Créer un Compte"
4. Pour chaque compte:
   - **Nom complet**: Demo 1 (ou Demo 2)
   - **Email**: demo1@onteech.com (ou demo2@ontech.com)
   - **Mot de passe**: 123456
   - **Type d'utilisateur**: Élève (important: sélectionner "Élève" pour avoir les champs d'anniversaire)
   - **Date d'Anniversaire**: 
     - Demo 1: `2012-12-02` (2 décembre 2012)
     - Demo 2: `2012-12-03` (3 décembre 2012)
   - **Type de compte**: Compte Standard
   - **Rôle**: Élève
   - Décochez "Envoyer email de bienvenue" (optionnel)
   - Cliquez sur "Créer le Compte"

## Méthode 2: Via script Node.js (Nécessite Firebase Admin SDK)

### Prérequis

1. Installer firebase-admin (déjà fait):
   ```bash
   npm install firebase-admin
   ```

2. Télécharger la clé de service Firebase:
   - Allez sur: https://console.firebase.google.com/project/projet-aniversaire/settings/serviceaccounts/adminsdk
   - Cliquez sur "Générer une nouvelle clé privée"
   - Sauvegardez le fichier JSON comme `firebase-service-account-key.json` dans le dossier du projet

3. Modifier `create-demo-users.js`:
   - Décommenter les lignes pour utiliser la clé de service
   - Modifier le chemin vers votre fichier de clé

4. Exécuter le script:
   ```bash
   node create-demo-users.js
   ```

## Méthode 3: Via script dans la console du navigateur

1. Ouvrez `super-admin.html` dans votre navigateur
2. Connectez-vous en tant qu'administrateur
3. Ouvrez la console du navigateur (F12)
4. Copiez le contenu de `create-demo-script.js`
5. Collez-le dans la console et appuyez sur Entrée

## Vérification

Après création, vous pouvez vous connecter avec:
- Email: `demo1@onteech.com` / Mot de passe: `123456`
- Email: `demo2@ontech.com` / Mot de passe: `123456`

