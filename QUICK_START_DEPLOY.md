# 🚀 Démarrage Rapide - Déploiement Automatique

## ⚡ Option la plus rapide : Firebase Cloud Functions

### 1. Installation (une seule fois)
```bash
npm install -g firebase-tools
firebase login
```

### 2. Configuration (une seule fois)
```bash
# Dans le dossier du projet
firebase init functions
# Sélectionner votre projet, JavaScript, installer dépendances

# Configurer SendGrid
firebase functions:config:set sendgrid.api_key="votre_cle_api_sendgrid"
firebase functions:config:set sendgrid.from_email="noreply@203celebrationhub.com"
```

### 3. Déploiement
```bash
firebase deploy --only functions
```

### 4. Mettre à jour les URLs

Après le déploiement, Firebase vous donnera les URLs. Mettez à jour dans :
- `admin.html` ligne ~572
- `committee.html` ligne ~512  
- `eleve.html` ligne ~256

Remplacez :
```javascript
const EMAIL_API_URL = 'http://localhost:3001/api';
```

Par (exemple) :
```javascript
const EMAIL_API_URL = 'https://us-central1-projet-aniversaire.cloudfunctions.net';
```

**C'est tout ! Le serveur sera toujours actif.** ✅

---

## 🔄 Alternatives rapides

### Render.com (Gratuit)
1. Créer un compte sur render.com
2. Connecter GitHub
3. Créer un "Web Service"
4. Configurer les variables d'environnement
5. Déployer automatiquement

### Railway.app (Gratuit)
1. Créer un compte sur railway.app
2. Nouveau projet depuis GitHub
3. Configurer les variables
4. Déployer automatiquement

Voir `DEPLOIEMENT.md` pour les détails complets.




