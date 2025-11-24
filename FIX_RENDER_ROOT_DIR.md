# 🔧 Correction - Root Directory Render

## ❌ Problème

Render cherche `package.json` dans `/opt/render/project/src/` mais il est à la racine du repository.

Erreur :
```
npm error path /opt/render/project/src/package.json
npm error enoent Could not read package.json
```

## ✅ Solution

### Option 1 : Spécifier le Root Directory (Recommandé)

1. Allez dans **Settings** de votre service `email-api` sur Render
2. Dans la section **Build & Deploy**, trouvez **Root Directory**
3. Laissez-le **VIDE** ou mettez `.` (point)
4. Render cherchera alors à la racine du repository

### Option 2 : Vérifier que package.json est bien commité

Assurez-vous que `package.json` est bien dans votre repository GitHub :

```bash
git add package.json
git commit -m "Add package.json for Render deployment"
git push
```

### Option 3 : Configuration Complète dans Render

Dans **Settings** > **Build & Deploy** :

```
Root Directory: (vide ou .)
Build Command: npm install
Start Command: node email-api-server.js
```

## 📋 Checklist

- [ ] Root Directory est vide ou `.`
- [ ] Build Command = `npm install`
- [ ] Start Command = `node email-api-server.js`
- [ ] Variables d'environnement configurées :
  - [ ] `SENDGRID_API_KEY`
  - [ ] `SENDGRID_FROM_EMAIL`
  - [ ] `PORT` (optionnel)

## ✅ Après Correction

1. Cliquez sur **Manual Deploy** > **Deploy latest commit**
2. Attendez 1-2 minutes
3. Vérifiez les logs pour confirmer le succès




