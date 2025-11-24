# 🚀 Déploiement Automatique sur Render.com

## ⚡ Étapes rapides (5 minutes)

### 1. Créer un compte Render
Allez sur https://render.com et créez un compte (gratuit, pas de carte de crédit)

### 2. Connecter GitHub
- Cliquez sur "New" > "Web Service"
- Connectez votre repository GitHub
- Sélectionnez le repository "Projet-aniversaire"

### 3. Configurer le service
- **Name** : `email-api`
- **Environment** : `Node`
- **Build Command** : `npm install`
- **Start Command** : `node email-api-server.js`
- **Plan** : Free

### 4. Variables d'environnement
Ajoutez ces variables dans la section "Environment" :
```
SENDGRID_API_KEY=votre_cle_api_sendgrid
SENDGRID_FROM_EMAIL=noreply@203celebrationhub.com
PORT=10000
```

### 5. Déployer
Cliquez sur "Create Web Service" - Render déploiera automatiquement !

### 6. Mettre à jour les URLs
Une fois déployé, vous obtiendrez une URL comme : `https://email-api-xxxx.onrender.com`

Mettez à jour dans `admin.html`, `committee.html`, `eleve.html` :
```javascript
const EMAIL_API_URL = 'https://email-api-xxxx.onrender.com/api';
```

## ✅ C'est tout !

Le serveur sera toujours actif et se redéploiera automatiquement à chaque push sur GitHub.




