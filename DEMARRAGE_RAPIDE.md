# 🚀 Guide de Démarrage Rapide - Système d'Emails

## ✅ Configuration terminée

Votre fichier `.env` a été créé avec votre clé API SendGrid.

## 📋 Étapes pour démarrer

### 1. Vérifier l'email FROM dans SendGrid

⚠️ **Important** : Avant d'envoyer des emails, vous devez vérifier votre domaine ou email dans SendGrid :

1. Allez sur [SendGrid Dashboard](https://app.sendgrid.com)
2. Allez dans **Settings > Sender Authentication**
3. Vérifiez votre domaine ou créez un "Single Sender Verification"
4. Utilisez l'email vérifié dans le fichier `.env` (actuellement: `noreply@203celebrationhub.com`)

### 2. Démarrer le serveur API Email

Dans un terminal, lancez :

```bash
npm start
```

Le serveur démarrera sur `http://localhost:3001`

Vous devriez voir :
```
============================================================
Serveur API Email démarré avec succès!
============================================================
Port: 3001
Endpoints disponibles:
  POST http://localhost:3001/api/send-welcome-email
  POST http://localhost:3001/api/send-message-notification
  GET  http://localhost:3001/api/health
============================================================
```

### 3. Tester l'API

Vous pouvez tester l'endpoint de santé :

```bash
curl http://localhost:3001/api/health
```

### 4. Utiliser l'application

1. **Démarrer le serveur web** (dans un autre terminal) :
```bash
python server.py
```

2. **Créer un compte** via l'interface admin :
   - L'email de bienvenue sera automatiquement envoyé

3. **Envoyer un message** via l'interface élève :
   - La notification par email sera automatiquement envoyée

## 🔧 Configuration de l'URL de l'API

Si vous déployez le serveur API ailleurs qu'en localhost, modifiez l'URL dans :

- `admin.html` (ligne ~572)
- `committee.html` (ligne ~512)
- `eleve.html` (ligne ~256)

Changez :
```javascript
const EMAIL_API_URL = 'http://localhost:3001/api';
```

Par votre URL de production, par exemple :
```javascript
const EMAIL_API_URL = 'https://votre-serveur.com/api';
```

## 🐛 Dépannage

### Erreur "API Key invalid"
- Vérifiez que votre clé API est correcte dans `.env`
- Vérifiez que la clé API a les permissions d'envoi d'emails

### Emails non reçus
- Vérifiez les logs du serveur API
- Vérifiez le dashboard SendGrid pour voir les emails envoyés
- Vérifiez que l'email FROM est vérifié dans SendGrid

### Erreur CORS
- Le serveur API est configuré pour accepter les requêtes CORS
- Si vous avez des problèmes, vérifiez que le serveur API est accessible depuis votre domaine

## 📧 Templates d'emails

Les templates HTML sont dans le dossier `email-templates/` :
- `welcome-email.html` - Email de bienvenue
- `message-notification.html` - Notification de message

Vous pouvez les personnaliser selon vos besoins !

## 🎉 C'est prêt !

Votre système d'emails est maintenant configuré et prêt à être utilisé !




