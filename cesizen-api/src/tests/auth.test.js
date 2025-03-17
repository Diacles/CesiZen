const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock des dépendances
jest.mock('../src/config/database', () => ({
  query: jest.fn(),
  pool: {
    connect: jest.fn().mockReturnValue({
      query: jest.fn(),
      release: jest.fn()
    })
  }
}));

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

// Import des modules à tester après les mocks
const userController = require('../src/controllers/userController');
const db = require('../src/config/database');

// App Express minimale pour tester les routes
const app = express();
app.use(express.json());

// Configuration des routes pour les tests
app.post('/api/users/register', (req, res) => userController.register(req, res));
app.post('/api/users/login', (req, res) => userController.login(req, res));
app.post('/api/users/forgot-password', (req, res) => userController.forgotPassword(req, res));

describe('Tests des routes d\'authentification', () => {
  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test_secret';
  });

  describe('POST /api/users/register', () => {
    test('Devrait créer un nouvel utilisateur avec succès', async () => {
      // Simuler l'absence d'utilisateur existant
      db.query.mockResolvedValueOnce({ rows: [] });
      
      // Simuler le hachage du mot de passe
      bcrypt.hash.mockResolvedValueOnce('hashed_password');
      
      // Simuler l'insertion en base de données
      db.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
          created_at: new Date()
        }]
      });

      const response = await request(app)
        .post('/api/users/register')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
          firstName: 'John',
          lastName: 'Doe'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.email).toBe('test@example.com');
      
      // Vérifier que les fonctions ont été appelées correctement
      expect(db.query).toHaveBeenCalledTimes(2);
      expect(bcrypt.hash).toHaveBeenCalledWith('Password123!', 10);
    });

    test('Devrait rejeter l\'inscription si l\'email existe déjà', async () => {
      // Simuler un utilisateur existant
      db.query.mockResolvedValueOnce({
        rows: [{ id: 1, email: 'test@example.com' }]
      });

      const response = await request(app)
        .post('/api/users/register')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
          firstName: 'John',
          lastName: 'Doe'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Un utilisateur avec cet email existe déjà');
      
      // Vérifier que bcrypt n'a pas été appelé
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/users/login', () => {
    test('Devrait connecter un utilisateur avec des identifiants valides', async () => {
      // Simuler un utilisateur trouvé
      db.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          email: 'test@example.com',
          password_hash: 'hashed_password'
        }]
      });

      // Simuler la comparaison du mot de passe
      bcrypt.compare.mockResolvedValueOnce(true);
      
      // Simuler la génération du token JWT
      jwt.sign.mockReturnValueOnce('fake_token');

      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBe('fake_token');
      
      // Vérifier que les fonctions ont été appelées correctement
      expect(db.query).toHaveBeenCalledTimes(1);
      expect(bcrypt.compare).toHaveBeenCalledWith('Password123!', 'hashed_password');
      expect(jwt.sign).toHaveBeenCalledWith({ userId: 1 }, 'test_secret', { expiresIn: '24h' });
    });

    test('Devrait rejeter la connexion avec des identifiants invalides', async () => {
      // Simuler un utilisateur trouvé
      db.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          email: 'test@example.com',
          password_hash: 'hashed_password'
        }]
      });

      // Simuler un échec de comparaison du mot de passe
      bcrypt.compare.mockResolvedValueOnce(false);

      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword123!'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email ou mot de passe incorrect');
      
      // Vérifier que JWT n'a pas été appelé
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    test('Devrait rejeter la connexion si l\'utilisateur n\'existe pas', async () => {
      // Simuler aucun utilisateur trouvé
      db.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email ou mot de passe incorrect');
      
      // Vérifier que bcrypt n'a pas été appelé
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/users/forgot-password', () => {
    test('Devrait traiter la demande de réinitialisation pour un email existant', async () => {
      // Importer et mocker le service de mot de passe
      const passwordService = require('../src/services/passwordService');
      jest.mock('../src/services/passwordService', () => ({
        createResetToken: jest.fn().mockResolvedValue('reset_token')
      }));

      // Simuler un utilisateur trouvé
      db.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          email: 'test@example.com',
          first_name: 'John'
        }]
      });

      const response = await request(app)
        .post('/api/users/forgot-password')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      // Le message de succès est intentionnellement vague pour des raisons de sécurité
      expect(response.body.message).toContain('Si un compte existe');
    });

    test('Devrait renvoyer un message de succès même si l\'email n\'existe pas', async () => {
      // Simuler qu'aucun utilisateur n'est trouvé
      db.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .post('/api/users/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      // Le message de succès est le même pour ne pas révéler l'existence d'un compte
      expect(response.body.message).toContain('Si un compte existe');
      
      // Vérifier que le service n'a pas été appelé
      const passwordService = require('../src/services/passwordService');
      expect(passwordService.createResetToken).not.toHaveBeenCalled();
    });
  });
});