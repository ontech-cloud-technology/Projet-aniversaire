# 🚀 Guide de Déploiement - Serveur API Email

Ce guide explique comment déployer le serveur API email pour qu'il soit toujours actif en production.

## 📋 Options de Déploiement

### Option 1 : Firebase Cloud Functions (⭐ Recommandé)

**Avantages** :
- ✅ Gratuit jusqu'à 2 millions d'invocations/mois
- ✅ Intégration native avec Firebase
- ✅ Pas de serveur à gérer
- ✅ Mise à l'échelle automatique

**Étapes** :

1. **Installer Firebase CLI** :
```bash
npm install -g firebase-tools
```

2. **Se connecter à Firebase** :
```bash
firebase login
```

3. **Initialiser Firebase Functions** :
```bash
firebase init functions
```
- Sélectionner votre projet Firebase
- Utiliser JavaScript
- Installer les dépendances

4. **Configurer SendGrid** :
```bash
firebase functions:config:set sendgrid.api_key="SG.votre_cle_api"
firebase functions:config:set sendgrid.from_email="noreply@votredomaine.com"
```

5. **Déployer** :
```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

6. **Mettre à jour les URLs dans le frontend** :
```javascript
// Dans admin.html, committee.html, eleve.html
const EMAIL_API_URL = 'https://us-central1-votre-projet.cloudfunctions.net/api';
```

Les endpoints seront :
- `https://us-central1-votre-projet.cloudfunctions.net/sendWelcomeEmail`
- `https://us-central1-votre-projet.cloudfunctions.net/sendMessageNotification`
- `https://us-central1-votre-projet.cloudfunctions.net/health`

---

### Option 2 : Render (⭐ Simple et gratuit)

**Avantages** :
- ✅ Gratuit pour les services web
- ✅ Déploiement automatique depuis GitHub
- ✅ SSL automatique
- ✅ Redémarrage automatique

**Étapes** :

1. **Créer un compte sur [Render](https://render.com)**

2. **Connecter votre repository GitHub**

3. **Créer un nouveau Web Service** :
   - Repository : votre repo
   - Name : `email-api`
   - Environment : `Node`
   - Build Command : `npm install`
   - Start Command : `node email-api-server.js`
   - Plan : Free

4. **Configurer les variables d'environnement** dans le dashboard Render :
   - `SENDGRID_API_KEY` : votre clé API
   - `SENDGRID_FROM_EMAIL` : noreply@votredomaine.com
   - `PORT` : 10000 (Render utilise ce port)

5. **Déployer** : Render déploiera automatiquement

6. **Mettre à jour les URLs** :
```javascript
const EMAIL_API_URL = 'https://email-api.onrender.com/api';
```

---

### Option 3 : Railway (⭐ Simple)

**Avantages** :
- ✅ Gratuit avec crédits mensuels
- ✅ Déploiement depuis GitHub
- ✅ Configuration simple

**Étapes** :

1. **Créer un compte sur [Railway](https://railway.app)**

2. **Nouveau projet depuis GitHub**

3. **Configurer** :
   - Root Directory : `/`
   - Start Command : `node email-api-server.js`

4. **Variables d'environnement** :
   - `SENDGRID_API_KEY`
   - `SENDGRID_FROM_EMAIL`
   - `PORT` : Railway définit automatiquement le port via `$PORT`

5. **Mettre à jour le code** pour utiliser `process.env.PORT` :
```javascript
const PORT = process.env.PORT || 3001;
```

6. **Mettre à jour les URLs** :
```javascript
const EMAIL_API_URL = 'https://votre-projet.railway.app/api';
```

---

### Option 4 : VPS avec PM2 (Pour serveur dédié)

**Avantages** :
- ✅ Contrôle total
- ✅ Pas de limites
- ✅ Redémarrage automatique

**Étapes** :

1. **Installer Node.js et PM2** :
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

2. **Cloner le projet** :
```bash
git clone votre-repo
cd Projet-aniversaire
npm install
```

3. **Configurer les variables d'environnement** :
```bash
nano .env
# Ajouter SENDGRID_API_KEY, SENDGRID_FROM_EMAIL, PORT
```

4. **Démarrer avec PM2** :
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Pour démarrer au boot
```

5. **Configurer Nginx** (reverse proxy) :
```nginx
server {
    listen 80;
    server_name api.votredomaine.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

### Option 5 : Heroku

**Étapes** :

1. **Installer Heroku CLI** :
```bash
npm install -g heroku
```

2. **Se connecter** :
```bash
heroku login
```

3. **Créer l'application** :
```bash
heroku create votre-app-name
```

4. **Configurer les variables** :
```bash
heroku config:set SENDGRID_API_KEY=votre_cle
heroku config:set SENDGRID_FROM_EMAIL=noreply@votredomaine.com
```

5. **Déployer** :
```bash
git push heroku main
```

6. **Mettre à jour les URLs** :
```javascript
const EMAIL_API_URL = 'https://votre-app-name.herokuapp.com/api';
```

---

## 🔧 Mise à jour du Frontend

Après déploiement, mettez à jour l'URL de l'API dans :

1. **admin.html** (ligne ~572)
2. **committee.html** (ligne ~512)
3. **eleve.html** (ligne ~256)

Remplacez :
```javascript
const EMAIL_API_URL = 'http://localhost:3001/api';
```

Par votre URL de production, par exemple :
```javascript
// Firebase Cloud Functions
const EMAIL_API_URL = 'https://us-central1-votre-projet.cloudfunctions.net';

// Render
const EMAIL_API_URL = 'https://email-api.onrender.com/api';

// Railway
const EMAIL_API_URL = 'https://votre-projet.railway.app/api';
```

---

## ✅ Vérification

Testez votre déploiement :

```bash
curl https://votre-url/api/health
```

Vous devriez recevoir :
```json
{"status":"ok","service":"email-api"}
```

---

## 🎯 Recommandation

Pour ce projet, **Firebase Cloud Functions** est la meilleure option car :
- ✅ Vous utilisez déjà Firebase
- ✅ Gratuit pour la plupart des cas d'usage
- ✅ Pas de serveur à gérer
- ✅ Intégration native




