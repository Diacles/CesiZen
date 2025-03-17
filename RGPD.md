# Conformité RGPD - CESIZen

## Données personnelles traitées
- Données d'identification: nom, prénom, email
- Données de santé: émotions enregistrées par l'utilisateur
- Données de connexion: journaux d'activité, adresses IP

## Base légale du traitement
- Consentement explicite lors de l'inscription
- Intérêt légitime pour les fonctionnalités essentielles de l'application
- Contrat d'utilisation accepté par l'utilisateur

## Information des utilisateurs
Les utilisateurs sont informés de manière claire et transparente via:
- Politique de confidentialité accessible lors de l'inscription
- Mentions légales disponibles sur le site
- Demande de consentement explicite pour le traitement des données sensibles

## Mesures techniques implémentées

### 1. Sécurisation des données
- Hachage des mots de passe avec bcrypt et sel aléatoire
- Communication HTTPS pour toutes les requêtes
- Tokens JWT à durée limitée (24h)
- Principe de moindre privilège dans les accès à la base de données
- Validation des entrées utilisateur pour prévenir les injections

### 2. Gestion des accès
- Authentification robuste à deux facteurs (disponible en option)
- Séparation des rôles (utilisateur, praticien, administrateur)
- Journalisation des tentatives d'accès échouées
- Session automatiquement expirée après inactivité

### 3. Cycle de vie des données
- Possibilité de suppression du compte utilisateur et de toutes ses données
- Tokens de réinitialisation de mot de passe à durée limitée (1h)
- Processus d'anonymisation pour les données conservées à des fins statistiques
- Rétention limitée des données de journalisation (90 jours)

## Droits des utilisateurs

L'application permet aux utilisateurs d'exercer leurs droits RGPD:

### Droit d'accès et de rectification
- Consultation et modification des données personnelles via la page profil
- Export des données personnelles au format JSON/CSV

### Droit à l'effacement
- Compte supprimable à tout moment par l'utilisateur
- Suppression définitive des données personnelles

### Droit à la portabilité
- Export complet des données dans un format standard
- Possibilité d'importer des données depuis d'autres applications compatibles

### Droit d'opposition
- Paramètres de confidentialité permettant de limiter le traitement
- Désactivation possible des fonctionnalités non essentielles

## Responsabilités et contacts

**Responsable du traitement**:  
Ministère de la Santé et de la Prévention  
Adresse: 14 avenue Duquesne, 75350 PARIS 07 SP

**Délégué à la protection des données**:  
Email: dpo-cesizen@sante.gouv.fr

**Autorité de contrôle**:  
Commission Nationale de l'Informatique et des Libertés (CNIL)  
3 Place de Fontenoy - TSA 80715 - 75334 PARIS CEDEX 07  
Tél: 01 53 73 22 22  
www.cnil.fr