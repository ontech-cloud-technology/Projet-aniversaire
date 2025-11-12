# ⚙️ Configuration Render - Email Service

## 🔧 Variables d'Environnement à Configurer

Dans le dashboard Render, allez dans **Settings** > **Environment** et ajoutez :

### Variables Requises

```
SENDGRID_API_KEY = votre_cle_api_sendgrid
SENDER_EMAIL = liorangezgeg@gmail.com
```

### Variables Optionnelles

```
PORT = 10000
COMPANY_NAME = 203 Celebration Hub
SUPPORT_EMAIL = (vide)
ALLOWED_ORIGINS = (vide)
```

## 📋 Configuration Build & Deploy

- **Root Directory**: (LAISSEZ VIDE)
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

## ✅ Important

⚠️ **Assurez-vous que l'email `liorangezgeg@gmail.com` est vérifié dans SendGrid** :
1. Allez sur https://app.sendgrid.com
2. Settings > Sender Authentication
3. Vérifiez que cet email est dans la liste des expéditeurs vérifiés

## 🚀 Après Configuration

1. Cliquez sur **Manual Deploy** > **Deploy latest commit**
2. Attendez 1-2 minutes
3. Testez : `curl https://email-api-cs1c.onrender.com/api/health`

