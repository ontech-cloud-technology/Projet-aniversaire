# 🎉 203 Celebration Hub

> Système moderne de gestion des anniversaires pour la classe 203 de l'École d'Éducation Internationale de Laval

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](VERSION)
[![License](https://img.shields.io/badge/license-ISC-green.svg)](package.json)

---

## 📋 Table des matières

- [À propos](#-à-propos)
- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [Structure du projet](#-structure-du-projet)
- [Documentation](#-documentation)
- [Déploiement](#-déploiement)
- [Support](#-support)

---

## 🎯 À propos

**203 Celebration Hub** est une plateforme web moderne et sécurisée développée par **ONTech-cloud Technology** pour célébrer les anniversaires des élèves de la classe 203. Le système permet une gestion complète des célébrations avec des fonctionnalités avancées de calendrier, de messagerie, de notifications et de gestion des utilisateurs.

### Caractéristiques principales

- ✨ **Interface moderne** avec design glassmorphism
- 🔐 **Système d'authentification** multi-rôles (Admin, Professeur, Comité, Élève)
- 📅 **Calendrier interactif** des anniversaires
- 💬 **Système de messagerie** personnalisée
- 📧 **Notifications par email** automatiques
- 📊 **Tableau de bord** administratif complet
- 🎨 **Thèmes personnalisables**
- 📱 **100% Responsive**

---

## ✨ Fonctionnalités

### Pour les Élèves
- 📅 Visualisation du calendrier des anniversaires
- 💌 Envoi de messages personnalisés pour souhaiter un joyeux anniversaire
- 📧 Réception de notifications par email
- 👤 Gestion du profil personnel
- 🏆 Participation aux défis de classe
- ⭐ Système de favoris et de progression

### Pour les Professeurs
- 👥 Consultation de toutes les fiches élèves
- 📝 Envoi de messages du jour
- 🎨 Personnalisation des thèmes
- 📊 Consultation des statistiques
- 📅 Gestion du calendrier

### Pour le Comité
- ➕ Ajout/modification des anniversaires
- 📊 Affichage des statistiques
- 💡 Suggestions d'activités
- 📅 Gestion limitée du calendrier

### Pour les Administrateurs
- 👥 **Gestion complète des utilisateurs** (création, modification, suppression)
- 🔐 **Gestion des rôles et permissions**
- 📅 **Gestion complète des anniversaires**
- 🎨 **Configuration des thèmes et paramètres**
- 📊 **Tableau de bord avec statistiques détaillées**
- 📧 **Gestion du système d'emails**
- 📝 **Journal des activités**
- 🔄 **Import/Export Excel**

---

## 🛠️ Technologies

### Frontend
- **HTML5** / **CSS3** / **JavaScript** (Vanilla)
- **Tailwind CSS** (CDN) - Framework CSS utilitaire
- **Lucide Icons** - Bibliothèque d'icônes modernes
- **Google Fonts** (Inter) - Typographie

### Backend & Services
- **Firebase Authentication** - Authentification utilisateurs
- **Cloud Firestore** - Base de données NoSQL
- **Firebase Storage** - Stockage de fichiers
- **Firebase Hosting** - Hébergement
- **Express.js** - Serveur API pour emails
- **SendGrid** - Service d'envoi d'emails

### Outils & Utilitaires
- **Node.js** - Runtime JavaScript
- **npm** - Gestionnaire de paquets
- **LibreOffice** / **Poppler** - Conversion PPTX → PNG

---

## 🚀 Installation

### Prérequis

- Node.js (v14 ou supérieur)
- npm ou yarn
- Compte Firebase avec projet configuré
- Compte SendGrid (pour les emails)
- LibreOffice et Poppler (pour la conversion de présentations)

### Étapes d'installation

1. **Cloner le dépôt**
   ```bash
   git clone <repository-url>
   cd Projet-aniversaire
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer Firebase**
   - Créer un projet Firebase
   - Activer Authentication (Email/Password)
   - Créer une base de données Firestore
   - Configurer Firebase Storage
   - Copier la configuration dans `firebase.js`

4. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env
   ```
   Éditer `.env` avec vos clés API :
   ```env
   SENDGRID_API_KEY=votre_cle_api_sendgrid
   SENDER_EMAIL=noreply@votredomaine.com
   PORT=3001
   ```

5. **Configurer SendGrid**
   - Créer une clé API SendGrid
   - Vérifier l'email expéditeur dans SendGrid Dashboard
   - Voir [README_EMAIL.md](README_EMAIL.md) pour plus de détails

---

## ⚙️ Configuration

### Configuration Firebase

Modifier `firebase.js` avec vos credentials Firebase :

```javascript
const firebaseConfig = {
  apiKey: "votre-api-key",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet-id",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "votre-sender-id",
  appId: "votre-app-id"
};
```

### Configuration des rôles

Les rôles sont gérés dans Firestore dans la collection `users` :
- `admin` - Accès complet
- `prof` - Accès professeur
- `comite` - Accès comité
- `eleve` - Accès élève

### Configuration de l'API Email

L'URL de l'API email est configurée dans :
- `admin.html` (ligne ~572)
- `committee.html` (ligne ~512)
- `eleve.html` (ligne ~256)

Par défaut : `http://localhost:3001/api`

Pour la production, modifier :
```javascript
const EMAIL_API_URL = 'https://votre-serveur.com/api';
```

---

## 📖 Utilisation

### Démarrage du serveur de développement

1. **Démarrer le serveur API Email**
   ```bash
   npm start
   ```
   Le serveur démarre sur `http://localhost:3001`

2. **Démarrer le serveur web local** (dans un autre terminal)
   ```bash
   python server.py
   ```
   Ou utiliser un serveur HTTP simple :
   ```bash
   python -m http.server 8000
   ```

3. **Accéder à l'application**
   - Page d'accueil : `http://localhost:8000/index.html`
   - Connexion : `http://localhost:8000/login.html`

### Création de comptes

Les comptes peuvent être créés de deux manières :

1. **Manuellement par l'admin** via `admin.html`
2. **Automatiquement** lors de l'ajout d'une personne dans "Célébrations"
   - Le système génère un email : `[NuméroFiche]@cslaval.qc.ca`
   - Mot de passe temporaire : `login123`
   - L'utilisateur doit changer le mot de passe à la première connexion

Voir [SYSTEME_COMPTES.md](SYSTEME_COMPTES.md) pour plus de détails.

### Conversion de présentations

Pour convertir un PowerPoint en images pour la page de présentation :

```bash
npm run convert-pptx
```

Voir [PRESENTATION_README.md](PRESENTATION_README.md) pour plus de détails.

---

## 📁 Structure du projet

```
Projet-aniversaire/
├── api/                      # API Python pour conversion PPTX
├── css/                      # Fichiers CSS personnalisés
├── email-templates/            # Templates HTML pour emails
├── functions/                # Firebase Cloud Functions
├── js/                       # Modules JavaScript
│   ├── activity-logger.js
│   ├── announcements-system.js
│   ├── favorites-system.js
│   ├── leaderboard-system.js
│   ├── messaging-system.js
│   ├── permissions-system.js
│   ├── presentation-storage.js
│   ├── progression-system.js
│   ├── stats-system.js
│   ├── supabase-storage.js
│   ├── theme-manager.js
│   ├── vote-system.js
│   └── wishlist-system.js
├── logs/                     # Logs du serveur
├── presentation-slides/      # Images des slides de présentation
├── services/                 # Services backend
│   └── email-service.js
├── *.html                    # Pages principales
├── firebase.js               # Configuration Firebase
├── server.js                 # Serveur API Express
├── server.py                 # Serveur web Python
├── package.json              # Dépendances Node.js
└── *.md                      # Documentation
```

### Pages principales

- `index.html` - Page d'accueil avec design glassmorphism
- `login.html` - Page de connexion
- `eleve.html` - Interface élève (calendrier)
- `admin.html` - Interface administrateur
- `committee.html` - Interface comité
- `demo-admin.html` - Démo admin
- `super-admin.html` - Interface super-admin
- `presentation-admin.html` - Présentation PowerPoint
- `calendrier.html` - Calendrier des anniversaires
- `messages.html` - Système de messagerie
- `progression.html` - Suivi de progression
- `fetes-tracking.html` - Suivi des fêtes

---

## 📚 Documentation

Le projet contient une documentation complète :

- **[INDEX_INFO.md](INDEX_INFO.md)** - Documentation de la page d'accueil
- **[README_EMAIL.md](README_EMAIL.md)** - Documentation du système d'emails
- **[DEMARRAGE_RAPIDE.md](DEMARRAGE_RAPIDE.md)** - Guide de démarrage rapide
- **[SYSTEME_COMPTES.md](SYSTEME_COMPTES.md)** - Système de création de comptes
- **[PRESENTATION_README.md](PRESENTATION_README.md)** - Page de présentation
- **[PRESENTATION_ELEVES.md](PRESENTATION_ELEVES.md)** - Présentation pour les élèves
- **[PRESENTATION_PROFESSEUR.txt](PRESENTATION_PROFESSEUR.txt)** - Présentation pour le professeur
- **[CALENDRIER_INFO.md](CALENDRIER_INFO.md)** - Documentation du calendrier
- **[DEPLOIEMENT.md](DEPLOIEMENT.md)** - Guide de déploiement
- **[DEPLOIEMENT_RENDER.md](DEPLOIEMENT_RENDER.md)** - Déploiement sur Render
- **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** - Configuration Supabase

---

## 🚀 Déploiement

### Déploiement sur Firebase Hosting

1. Installer Firebase CLI
   ```bash
   npm install -g firebase-tools
   ```

2. Se connecter à Firebase
   ```bash
   firebase login
   ```

3. Initialiser Firebase Hosting
   ```bash
   firebase init hosting
   ```

4. Déployer
   ```bash
   firebase deploy --only hosting
   ```

### Déploiement sur Render

Voir [DEPLOIEMENT_RENDER.md](DEPLOIEMENT_RENDER.md) pour les instructions complètes.

### Déploiement du serveur API

Le serveur API Express peut être déployé séparément :
- Sur Render, Heroku, Railway, ou tout autre service Node.js
- Configurer les variables d'environnement
- Mettre à jour l'URL de l'API dans les fichiers HTML

---

## 🎨 Design

### Palette de couleurs

```css
--primary: #ff6f61;      /* Corail */
--secondary: #f9c74f;    /* Jaune doré */
--bg-dark: #0a0418;      /* Violet très foncé */
--bg-light: #1a0f30;     /* Violet foncé */
```

### Effets visuels

- **Glassmorphism** - Effet de verre avec flou
- **Animations CSS** - Transitions fluides
- **Dégradés** - Textes et boutons avec gradients
- **Responsive Design** - Adapté à tous les écrans

---

## 🔒 Sécurité

- ✅ Authentification Firebase sécurisée
- ✅ Règles de sécurité Firestore
- ✅ Validation côté client et serveur
- ✅ Protection CSRF
- ✅ Mots de passe temporaires uniques
- ✅ Gestion des permissions par rôle

---

## 📧 Système d'Emails

Le système envoie automatiquement :
- **Emails de bienvenue** lors de la création d'un compte
- **Notifications de messages** lorsqu'un utilisateur reçoit un message

Configuration requise :
- Compte SendGrid
- Email expéditeur vérifié
- Clé API configurée dans `.env`

Voir [README_EMAIL.md](README_EMAIL.md) pour plus de détails.

---

## 🧪 Scripts disponibles

```bash
npm start              # Démarrer le serveur API Email
npm run convert-pptx   # Convertir PowerPoint en images
npm run version        # Afficher la version
npm run version:patch  # Incrémenter version patch
npm run version:minor  # Incrémenter version minor
npm run version:major  # Incrémenter version major
```

---

## 🤝 Contribution

Ce projet est développé par **ONTech-cloud Technology** pour la classe 203.

Pour contribuer :
1. Créer une branche pour votre fonctionnalité
2. Faire vos modifications
3. Soumettre une pull request

---

## 📝 Licence

ISC License - Voir [package.json](package.json) pour plus de détails.

---

## 🆘 Support

Pour toute question ou problème :
- Consulter la documentation dans les fichiers `.md`
- Vérifier les logs dans `logs/`
- Contacter l'équipe ONTech-cloud Technology

---

## 🎉 Remerciements

Développé avec ❤️ par **ONTech-cloud Technology** pour la classe 203 de l'École d'Éducation Internationale de Laval.

---

**Version actuelle :** 1.0.0  
**Dernière mise à jour :** 2024
