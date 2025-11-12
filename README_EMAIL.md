# 📧 Système d'Emails - Documentation

## 📋 Vue d'ensemble

Ce système d'emails permet d'envoyer automatiquement :
- **Emails de bienvenue** lors de la création d'un compte
- **Notifications de messages** lorsqu'un utilisateur reçoit un message

## 🏗️ Architecture

```
services/
  └── email-service.js      # Service principal d'envoi d'emails
email-templates/
  ├── welcome-email.html    # Template email de bienvenue
  └── message-notification.html  # Template notification de message
server.js                   # Serveur API Express
```

## ⚙️ Configuration

### Variables d'environnement requises

Créez un fichier `.env` à la racine du projet :

```env
# SendGrid (requis)
SENDGRID_API_KEY=votre_cle_api_sendgrid

# Email expéditeur (requis)
SENDER_EMAIL=noreply@votredomaine.com

# Optionnel
COMPANY_NAME=203 Celebration Hub
SUPPORT_EMAIL=support@votredomaine.com
PORT=3001
ALLOWED_ORIGINS=https://votredomaine.com,https://www.votredomaine.com
```

### Obtenir une clé API SendGrid

1. Créer un compte sur [SendGrid](https://sendgrid.com)
2. Aller dans **Settings > API Keys**
3. Créer une nouvelle clé API avec les permissions "Mail Send"
4. Copier la clé dans votre fichier `.env`

### Vérifier l'email expéditeur

⚠️ **Important** : L'email dans `SENDER_EMAIL` doit être vérifié dans SendGrid :

1. Aller dans **Settings > Sender Authentication**
2. Vérifier votre domaine ou créer un "Single Sender Verification"
3. Utiliser l'email vérifié dans `.env`

## 🚀 Démarrage

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer les variables d'environnement

Créez le fichier `.env` avec vos configurations (voir ci-dessus).

### 3. Démarrer le serveur

```bash
npm start
```

Le serveur démarre sur `http://localhost:3001` par défaut.

## 📡 API Endpoints

### Health Check

```http
GET /api/health
```

Réponse :
```json
{
  "status": "ok",
  "service": "email-api"
}
```

### Envoyer un email de bienvenue

```http
POST /api/send-welcome-email
Content-Type: application/json

{
  "email": "user@example.com",
  "fullName": "Jean Dupont",
  "tempPassword": "motdepasse123",
  "role": "eleve",
  "loginUrl": "https://203celebrationhub.com/login.html"
}
```

Réponse :
```json
{
  "success": true,
  "message": "Email envoyé avec succès"
}
```

### Envoyer une notification de message

```http
POST /api/send-message-notification
Content-Type: application/json

{
  "email": "user@example.com",
  "recipientName": "Jean Dupont",
  "senderName": "Marie Martin",
  "message": "Joyeux anniversaire !",
  "isPublic": false,
  "notificationsUrl": "https://203celebrationhub.com/eleve.html#notifications",
  "birthdayMessage": "Ton anniversaire approche !"
}
```

Réponse :
```json
{
  "success": true,
  "message": "Notification envoyée avec succès"
}
```

## 🔌 Intégration Frontend

Le système est déjà intégré dans :
- `admin.html` - Envoi d'email lors de la création d'un compte
- `committee.html` - Envoi d'email lors de la création d'un compte
- `eleve.html` - Notification lors de la réception d'un message

### Configuration de l'URL de l'API

Par défaut, l'URL de l'API est `http://localhost:3001/api`.

Pour la production, modifiez dans chaque fichier HTML :

```javascript
const EMAIL_API_URL = 'https://votre-serveur.com/api';
```

## 🧪 Test

### Tester l'endpoint de santé

```bash
curl http://localhost:3001/api/health
```

### Tester l'envoi d'un email de bienvenue

```bash
curl -X POST http://localhost:3001/api/send-welcome-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "fullName": "Test User",
    "tempPassword": "test123"
  }'
```

## 🐛 Dépannage

### Erreur "SendGrid non configuré"

- Vérifiez que `SENDGRID_API_KEY` est défini dans `.env`
- Redémarrez le serveur après modification de `.env`

### Emails non reçus

1. Vérifiez les logs du serveur
2. Vérifiez que l'email expéditeur est vérifié dans SendGrid
3. Vérifiez le dashboard SendGrid pour les erreurs
4. Vérifiez le dossier spam du destinataire

### Erreur CORS

- Configurez `ALLOWED_ORIGINS` dans `.env` avec vos domaines
- Ou laissez vide pour autoriser toutes les origines (développement uniquement)

## 📝 Notes

- Les emails utilisent des templates HTML avec styles inline pour une meilleure compatibilité
- Le système ne bloque pas les opérations principales si l'envoi d'email échoue
- Les erreurs sont loggées dans la console mais n'interrompent pas le flux utilisateur

