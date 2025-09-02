# CESIZen - Application de santé mentale

## Présentation
CESIZen est une application web dédiée à la santé mentale, développée pour le Ministère de la Santé. Elle permet aux utilisateurs de suivre leurs émotions, d'accéder à des articles informatifs sur la santé mentale et de gérer leur profil.

## Fonctionnalités
- **Gestion de compte utilisateur** : inscription, connexion, réinitialisation de mot de passe
- **Articles informatifs** : consultation d'articles sur la santé mentale
- **Tracker d'émotions** : suivi quotidien des émotions avec visualisations et statistiques
- **Interface d'administration** : gestion des articles et utilisateurs

## Technologies utilisées
- **Frontend** : React, TailwindCSS
- **Backend** : Node.js, Express
- **Base de données** : PostgreSQL
- **Authentification** : JWT

## Installation
### Prérequis
- Node.js v14+
- PostgreSQL 13+

### Configuration de la base de données
1. Créer une base de données PostgreSQL
2. Exécuter les scripts SQL présents dans `/cesizen-api/src/database/`

### Installation de l'API
```bash
cd cesizen-api
npm install
cp .env.example .env
# Configurer les variables d'environnement dans le fichier .env
npm run dev
```

### Installation du frontend
```bash
cd cesizen-front
npm install
cp .env.example .env
# Configurer les variables d'environnement dans le fichier .env
npm run dev
```

## Architecture du projet

### Structure du backend
```
cesizen-api/
├── src/
│   ├── config/         # Configuration (base de données, environnement)
│   ├── controllers/    # Contrôleurs des routes
│   ├── database/       # Scripts SQL et migrations
│   ├── middlewares/    # Middlewares Express (auth, validation)
│   ├── models/         # Modèles de données
│   ├── routes/         # Définition des routes de l'API
│   ├── services/       # Services métier (email, passwords)
│   └── utils/          # Utilitaires divers
└── app.js              # Point d'entrée de l'application
```

### Structure du frontend
```
cesizen-front/
├── public/             # Ressources statiques
└── src/
    ├── components/     # Composants React réutilisables
    │   ├── layouts/    # Composants de mise en page
    │   └── ui/         # Composants d'interface utilisateur
    ├── contexts/       # Contextes React (auth, etc.)
    ├── pages/          # Pages de l'application
    │   ├── admin/      # Pages d'administration
    │   ├── auth/       # Pages d'authentification
    │   ├── emotions/   # Pages du tracker d'émotions
    │   └── ...
    ├── services/       # Services (API, etc.)
    └── utils/          # Utilitaires
```

## Sécurité et RGPD
CESIZen respecte le RGPD et implémente les mesures de sécurité suivantes:
- Chiffrement des mots de passe avec bcrypt
- Protection des communications avec HTTPS
- Tokens d'authentification à durée limitée
- Mécanisme sécurisé de réinitialisation des mots de passe

## Tests
Des tests unitaires et d'intégration sont disponibles:
```bash
# Lancer les tests backend
cd cesizen-api
npm test

# Lancer les tests frontend
cd cesizen-front
npm test
```

# Exemple de changement pour la soutenance
Hello World