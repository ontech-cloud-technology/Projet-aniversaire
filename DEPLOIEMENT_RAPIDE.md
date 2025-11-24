# ⚡ Déploiement Rapide - Firebase Cloud Functions

## 🎯 Option la plus simple (Recommandée)

### Étape 1 : Installer Firebase CLI
```bash
npm install -g firebase-tools
```

### Étape 2 : Se connecter
```bash
firebase login
```

### Étape 3 : Initialiser Functions (si pas déjà fait)
```bash
firebase init functions
```
- Sélectionner votre projet Firebase
- JavaScript
- Oui pour ESLint
- Installer les dépendances

### Étape 4 : Configurer SendGrid
```bash
firebase functions:config:set sendgrid.api_key="votre_cle_api_sendgrid"
firebase functions:config:set sendgrid.from_email="noreply@203celebrationhub.com"
```

### Étape 5 : Déployer
```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

### Étape 6 : Mettre à jour les URLs dans le frontend

Récupérez l'URL de votre fonction (elle sera affichée après le déploiement) et mettez à jour :

**admin.html, committee.html, eleve.html** :
```javascript
// Remplacer cette ligne :
const EMAIL_API_URL = 'http://localhost:3001/api';

// Par (remplacez par votre URL Firebase) :
const EMAIL_API_URL = 'https://us-central1-projet-aniversaire.cloudfunctions.net';
```

Les endpoints seront :
- `https://us-central1-projet-aniversaire.cloudfunctions.net/sendWelcomeEmail`
- `https://us-central1-projet-aniversaire.cloudfunctions.net/sendMessageNotification`
- `https://us-central1-projet-aniversaire.cloudfunctions.net/health`

## ✅ C'est tout !

Votre serveur API sera maintenant toujours actif et accessible depuis n'importe où.

## 🔄 Mises à jour futures

Pour mettre à jour le code :
```bash
firebase deploy --only functions
```

## 📊 Voir les logs

```bash
firebase functions:log
```

## 💰 Coûts

Firebase Cloud Functions est **gratuit** jusqu'à :
- 2 millions d'invocations/mois
- 400,000 GB-secondes/mois
- 200,000 GHz-secondes/mois

Plus que suffisant pour votre projet !




