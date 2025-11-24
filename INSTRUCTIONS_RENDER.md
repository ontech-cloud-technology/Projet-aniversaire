# 🚨 Instructions Urgentes - Correction Render

## Le Problème

Votre déploiement échoue avec cette erreur :
```
npm error enoent Could not read package.json
```

**Cause** : Le Build Command dans Render est configuré sur `npm start` au lieu de `npm install`.

## ✅ Solution Rapide (2 minutes)

### 1. Ouvrez votre dashboard Render
https://dashboard.render.com

### 2. Allez dans votre service `email-api`
Cliquez sur le service dans la liste

### 3. Cliquez sur "Settings" (Paramètres)

### 4. Dans la section "Build & Deploy", changez :

**AVANT (incorrect)** :
- Build Command: `npm start` ❌

**APRÈS (correct)** :
- Build Command: `npm install` ✅
- Start Command: `node email-api-server.js` ✅

### 5. Vérifiez les variables d'environnement

Dans la section "Environment", ajoutez/modifiez :

| Variable | Valeur |
|----------|--------|
| `SENDGRID_API_KEY` | `votre_cle_api_sendgrid` |
| `SENDGRID_FROM_EMAIL` | `noreply@203celebrationhub.com` |
| `PORT` | `10000` (ou laissez vide) |

### 6. Redéployez

Cliquez sur **"Manual Deploy"** > **"Deploy latest commit"**

## 📸 Aperçu de la Configuration

```
Build Command:    npm install
Start Command:    node email-api-server.js
Environment:      Node
Plan:             Free
```

## ✅ Après Correction

Une fois corrigé, attendez 1-2 minutes et votre service sera disponible sur :
`https://email-api-cs1c.onrender.com/api/health`

Vous pouvez tester avec :
```bash
curl https://email-api-cs1c.onrender.com/api/health
```

## ⚠️ Note Importante

Les services gratuits Render se mettent en veille après 15 minutes d'inactivité. Le premier appel peut prendre 30-60 secondes pour "réveiller" le service.




