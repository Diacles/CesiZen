const request = require('supertest');
const express = require('express');

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

// Mock du middleware d'authentification
jest.mock('../src/middlewares/auth', () => (req, res, next) => {
  req.user = { id: 1 }; // Simuler un utilisateur authentifié
  next();
});

// Import des modules à tester après les mocks
const emotionController = require('../src/controllers/emotionController');
const db = require('../src/config/database');

// App Express minimale pour tester les routes
const app = express();
app.use(express.json());

// Configuration des routes pour les tests
app.get('/api/emotions/categories', (req, res) => emotionController.getEmotionCategories(req, res));
app.get('/api/emotions/user', (req, res) => emotionController.getUserEmotions(req, res));
app.post('/api/emotions', (req, res) => emotionController.addEmotion(req, res));
app.put('/api/emotions/:id', (req, res) => emotionController.updateEmotion(req, res));
app.delete('/api/emotions/:id', (req, res) => emotionController.deleteEmotion(req, res));
app.get('/api/emotions/stats', (req, res) => emotionController.getEmotionStats(req, res));

describe('Tests de l\'API des émotions', () => {
  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    jest.clearAllMocks();
  });

  describe('GET /api/emotions/categories', () => {
    test('Devrait renvoyer toutes les catégories d\'émotions', async () => {
      // Données de test
      const mockCategories = [
        {
          id: 1,
          name: 'Joie',
          description: 'Émotions positives',
          emotions: [
            { id: 1, name: 'Bonheur' },
            { id: 2, name: 'Euphorie' }
          ]
        },
        {
          id: 2,
          name: 'Tristesse',
          description: 'Émotions négatives',
          emotions: [
            { id: 3, name: 'Mélancolie' },
            { id: 4, name: 'Chagrin' }
          ]
        }
      ];

      db.query.mockResolvedValueOnce({ rows: mockCategories });

      const response = await request(app).get('/api/emotions/categories');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockCategories);
      expect(db.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/emotions/user', () => {
    test('Devrait renvoyer les émotions de l\'utilisateur', async () => {
      // Données de test
      const mockEmotions = [
        {
          id: 1,
          intensity: 4,
          note: 'Belle journée',
          created_at: '2024-03-15T10:00:00Z',
          emotion_name: 'Bonheur',
          category_name: 'Joie'
        },
        {
          id: 2,
          intensity: 2,
          note: 'Nouvelles difficiles',
          created_at: '2024-03-14T14:30:00Z',
          emotion_name: 'Chagrin',
          category_name: 'Tristesse'
        }
      ];

      db.query.mockResolvedValueOnce({ rows: mockEmotions });

      const response = await request(app).get('/api/emotions/user');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockEmotions);
      expect(db.query).toHaveBeenCalledTimes(1);
      // Vérifier que l'ID utilisateur est utilisé dans la requête
      expect(db.query.mock.calls[0][1][0]).toBe(1);
    });

    test('Devrait filtrer les émotions par date', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const startDate = '2024-03-01T00:00:00Z';
      const endDate = '2024-03-31T23:59:59Z';
      
      await request(app)
        .get(`/api/emotions/user?startDate=${startDate}&endDate=${endDate}`);

      // Vérifier que les dates sont passées à la requête
      expect(db.query).toHaveBeenCalledTimes(1);
      expect(db.query.mock.calls[0][1]).toContain(1); // userId
      expect(db.query.mock.calls[0][1]).toContain(startDate);
      expect(db.query.mock.calls[0][1]).toContain(endDate);
    });
  });

  describe('POST /api/emotions', () => {
    test('Devrait ajouter une nouvelle émotion', async () => {
      // Simuler l'insertion réussie
      db.query.mockResolvedValueOnce({
        rows: [{ id: 5, created_at: '2024-03-17T09:00:00Z' }]
      });

      const newEmotion = {
        emotionId: 1,
        intensity: 5,
        note: 'Très heureux aujourd\'hui!'
      };

      const response = await request(app)
        .post('/api/emotions')
        .send(newEmotion);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({ id: 5, created_at: '2024-03-17T09:00:00Z' });
      
      // Vérifier que la requête contient les bonnes données
      expect(db.query).toHaveBeenCalledTimes(1);
      expect(db.query.mock.calls[0][1]).toEqual([1, 1, 5, 'Très heureux aujourd\'hui!']);
    });
  });

  describe('PUT /api/emotions/:id', () => {
    test('Devrait mettre à jour une émotion existante', async () => {
      // Simuler la mise à jour réussie
      db.query.mockResolvedValueOnce({
        rows: [{ id: 5, created_at: '2024-03-17T09:00:00Z' }]
      });

      const updatedEmotion = {
        intensity: 3,
        note: 'Sentiment mitigé finalement'
      };

      const response = await request(app)
        .put('/api/emotions/5')
        .send(updatedEmotion);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Vérifier que la requête contient les bonnes données
      expect(db.query).toHaveBeenCalledTimes(1);
      expect(db.query.mock.calls[0][1]).toEqual([5, 1, 3, 'Sentiment mitigé finalement']);
    });

    test('Devrait renvoyer une erreur 404 si l\'émotion n\'existe pas', async () => {
      // Simuler aucune ligne affectée
      db.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .put('/api/emotions/999')
        .send({ intensity: 3, note: 'Note mise à jour' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('non trouvée');
    });
  });

  describe('DELETE /api/emotions/:id', () => {
    test('Devrait supprimer une émotion existante', async () => {
      // Simuler la suppression réussie
      db.query.mockResolvedValueOnce({
        rows: [{ id: 5 }]
      });

      const response = await request(app).delete('/api/emotions/5');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('supprimée avec succès');
      
      // Vérifier que la requête contient les bonnes données
      expect(db.query).toHaveBeenCalledTimes(1);
      expect(db.query.mock.calls[0][1]).toEqual([5, 1]);
    });

    test('Devrait renvoyer une erreur 404 si l\'émotion n\'existe pas', async () => {
      // Simuler aucune ligne affectée
      db.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app).delete('/api/emotions/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('non trouvée');
    });
  });

  describe('GET /api/emotions/stats', () => {
    test('Devrait renvoyer les statistiques des émotions', async () => {
      // Mockées pour les trois requêtes de statistiques
      db.query.mockResolvedValueOnce({ rows: [{ name: 'Joie', count: '10' }] }); // categoryStats
      db.query.mockResolvedValueOnce({ rows: [{ name: 'Bonheur', category: 'Joie', count: '5' }] }); // topEmotions
      db.query.mockResolvedValueOnce({ rows: [{ date: '2024-03-15T00:00:00Z', category: 'Joie', count: '3' }] }); // timeData

      const response = await request(app).get('/api/emotions/stats?period=week');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('categoryStats');
      expect(response.body.data).toHaveProperty('topEmotions');
      expect(response.body.data).toHaveProperty('timeData');
      
      // Vérifier les appels à la base de données
      expect(db.query).toHaveBeenCalledTimes(3);
    });

    test('Devrait accepter différentes périodes', async () => {
      // Mockées pour les trois requêtes
      db.query.mockResolvedValueOnce({ rows: [] });
      db.query.mockResolvedValueOnce({ rows: [] });
      db.query.mockResolvedValueOnce({ rows: [] });

      await request(app).get('/api/emotions/stats?period=month');

      // Vérifier que les appels SQL contiennent la bonne période
      expect(db.query.mock.calls[0][0]).toContain("INTERVAL '1 month'");
    });
  });
});