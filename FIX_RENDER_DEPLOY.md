# 🔧 Correction du Déploiement Render

## ❌ Problème Actuel

L'erreur indique que Render cherche `package.json` mais ne le trouve pas. C'est parce que le **Build Command** est configuré sur `npm start` au lieu de `npm install`.

## ✅ Solution

### Étape 1 : Aller dans les Settings de votre service

1. Allez sur https://dashboard.render.com
2. Cliquez sur votre service `email-api`
3. Cliquez sur **Settings** dans le menu de gauche

### Étape 2 : Corriger les commandes

Dans la section **Build & Deploy**, modifiez :

**Build Command** :
```
npm install
```

**Start Command** :
```
node email-api-server.js
```

### Étape 3 : Vérifier les variables d'environnement

Dans la section **Environment**, assurez-vous d'avoir :

- `SENDGRID_API_KEY` = `votre_cle_api_sendgrid`
- `SENDGRID_FROM_EMAIL` = `noreply@203celebrationhub.com`
- `PORT` = `10000` (ou laissez vide, Render le définit automatiquement)

### Étape 4 : Redéployer

1. Cliquez sur **Manual Deploy** > **Deploy latest commit**
2. Ou faites un nouveau commit et push sur GitHub

## 📋 Configuration Complète

### Build Command
```
npm install
```

### Start Command
```
node email-api-server.js
```

### Environment Variables
```
SENDGRID_API_KEY=votre_cle_api_sendgrid
SENDGRID_FROM_EMAIL=noreply@203celebrationhub.com
PORT=10000
```

## ✅ Après correction

Une fois corrigé, le déploiement devrait réussir et votre serveur sera accessible sur :
`https://email-api-cs1c.onrender.com`




