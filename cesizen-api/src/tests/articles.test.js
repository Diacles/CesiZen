// tests/articles.test.js
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

// Mock du middleware de vérification de rôle
jest.mock('../src/middlewares/checkRole', () => () => (req, res, next) => {
  req.userRoles = ['ADMIN']; // Simuler un utilisateur admin
  next();
});

// Import des modules à tester après les mocks
const articleController = require('../src/controllers/articleController');
const db = require('../src/config/database');

// App Express minimale pour tester les routes
const app = express();
app.use(express.json());

// Configuration des routes pour les tests
app.get('/api/articles', (req, res) => articleController.getAllArticles(req, res));
app.get('/api/articles/categories', (req, res) => articleController.getCategories(req, res));
app.get('/api/articles/:slug', (req, res) => articleController.getArticleBySlug(req, res));
app.get('/api/articles/admin', (req, res) => articleController.getAdminArticles(req, res));
app.post('/api/articles', (req, res) => articleController.createArticle(req, res));
app.put('/api/articles/:id', (req, res) => articleController.updateArticle(req, res));
app.delete('/api/articles/:id', (req, res) => articleController.deleteArticle(req, res));

describe('Tests de l\'API des articles', () => {
  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    jest.clearAllMocks();
  });

  describe('GET /api/articles', () => {
    test('Devrait récupérer tous les articles publiés', async () => {
      // Données de test
      const mockArticles = [
        {
          id: 1,
          title: 'Premier article',
          slug: 'premier-article',
          summary: 'Résumé du premier article',
          image_url: null,
          published_at: '2024-03-15T10:00:00Z',
          first_name: 'John',
          last_name: 'Doe',
          categories: ['Santé mentale', 'Bien-être']
        },
        {
          id: 2,
          title: 'Deuxième article',
          slug: 'deuxieme-article',
          summary: 'Résumé du deuxième article',
          image_url: 'https://example.com/image.jpg',
          published_at: '2024-03-16T14:30:00Z',
          first_name: 'Jane',
          last_name: 'Smith',
          categories: ['Méditation']
        }
      ];

      // Simuler la réponse pour les articles
      db.query.mockResolvedValueOnce({ rows: mockArticles });
      // Simuler la réponse pour le comptage
      db.query.mockResolvedValueOnce({ rows: [{ total: '2' }] });

      const response = await request(app).get('/api/articles');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockArticles);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.total).toBe(2);
      
      expect(db.query).toHaveBeenCalledTimes(2);
    });

    test('Devrait filtrer les articles par catégorie', async () => {
      // Simuler des résultats vides pour simplifier
      db.query.mockResolvedValueOnce({ rows: [] });
      db.query.mockResolvedValueOnce({ rows: [{ total: '0' }] });

      await request(app).get('/api/articles?category=Méditation');

      // Vérifier que la requête SQL contient la catégorie
      expect(db.query).toHaveBeenCalledTimes(2);
      expect(db.query.mock.calls[0][0]).toContain('category');
      expect(db.query.mock.calls[0][1]).toContain('Méditation');
    });

    test('Devrait rechercher des articles par terme', async () => {
      // Simuler des résultats vides pour simplifier
      db.query.mockResolvedValueOnce({ rows: [] });
      db.query.mockResolvedValueOnce({ rows: [{ total: '0' }] });

      await request(app).get('/api/articles?search=stress');

      // Vérifier que la requête SQL contient le terme de recherche
      expect(db.query).toHaveBeenCalledTimes(2);
      expect(db.query.mock.calls[0][0]).toContain('ILIKE');
      expect(db.query.mock.calls[0][1]).toContain('%stress%');
    });
  });

  describe('GET /api/articles/categories', () => {
    test('Devrait récupérer toutes les catégories d\'articles', async () => {
      const mockCategories = [
        { id: 1, name: 'Santé mentale', description: 'Articles sur la santé mentale' },
        { id: 2, name: 'Bien-être', description: 'Articles sur le bien-être' },
        { id: 3, name: 'Méditation', description: 'Guides et exercices de méditation' }
      ];

      db.query.mockResolvedValueOnce({ rows: mockCategories });

      const response = await request(app).get('/api/articles/categories');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockCategories);
      
      expect(db.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/articles/:slug', () => {
    test('Devrait récupérer un article par son slug', async () => {
      const mockArticle = {
        id: 1,
        title: 'Premier article',
        slug: 'premier-article',
        summary: 'Résumé du premier article',
        content: '<p>Contenu de l\'article</p>',
        image_url: 'https://example.com/image.jpg',
        published_at: '2024-03-15T10:00:00Z',
        created_at: '2024-03-14T08:00:00Z',
        updated_at: '2024-03-15T09:30:00Z',
        first_name: 'John',
        last_name: 'Doe',
        categories: ['Santé mentale', 'Bien-être']
      };

      db.query.mockResolvedValueOnce({ rows: [mockArticle] });

      const response = await request(app).get('/api/articles/premier-article');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockArticle);
      
      expect(db.query).toHaveBeenCalledTimes(1);
      expect(db.query.mock.calls[0][1]).toEqual(['premier-article']);
    });

    test('Devrait renvoyer 404 si l\'article n\'existe pas', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app).get('/api/articles/article-inexistant');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('non trouvé');
    });
  });

  describe('POST /api/articles', () => {
    test('Devrait créer un nouvel article', async () => {
      // Mockée pour la requête de génération de slug
      const clientMock = {
        query: jest.fn(),
        release: jest.fn()
      };
      db.pool.connect.mockResolvedValueOnce(clientMock);
      
      // Simuler les différentes requêtes dans une transaction
      // Génération du slug
      clientMock.query.mockResolvedValueOnce({ rows: [{ slug: 'nouvel-article' }] });
      // Vérification de l'unicité du slug
      clientMock.query.mockResolvedValueOnce({ rows: [] });
      // Insertion de l'article
      clientMock.query.mockResolvedValueOnce({
        rows: [{
          id: 3,
          title: 'Nouvel article',
          slug: 'nouvel-article',
          created_at: '2024-03-17T10:00:00Z'
        }]
      });
      
      const newArticle = {
        title: 'Nouvel article',
        summary: 'Résumé du nouvel article',
        content: '<p>Contenu du nouvel article</p>',
        imageUrl: 'https://example.com/image.jpg',
        published: true,
        categoryIds: [1, 2]
      };

      const response = await request(app)
        .post('/api/articles')
        .send(newArticle);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(3);
      expect(response.body.data.slug).toBe('nouvel-article');
      
      // Vérifier les appels à la base de données
      expect(db.pool.connect).toHaveBeenCalledTimes(1);
      expect(clientMock.query).toHaveBeenCalledWith('BEGIN');
      // Vérifier que la transaction a été validée
      expect(clientMock.query).toHaveBeenCalledWith('COMMIT');
      expect(clientMock.release).toHaveBeenCalledTimes(1);
    });
  });

  describe('PUT /api/articles/:id', () => {
    test('Devrait mettre à jour un article existant', async () => {
      // Mockée pour la requête de vérification de l'article
      const clientMock = {
        query: jest.fn(),
        release: jest.fn()
      };
      db.pool.connect.mockResolvedValueOnce(clientMock);
      
      // Simuler les différentes requêtes dans une transaction
      // Vérification de l'existence de l'article
      clientMock.query.mockResolvedValueOnce({
        rows: [{ author_id: 1, published: false }]
      });
      // Mise à jour de l'article
      clientMock.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          title: 'Article mis à jour',
          slug: 'premier-article',
          updated_at: '2024-03-17T15:30:00Z'
        }]
      });
      
      const updatedArticle = {
        title: 'Article mis à jour',
        summary: 'Résumé mis à jour',
        content: '<p>Contenu mis à jour</p>',
        imageUrl: 'https://example.com/new-image.jpg',
        published: true,
        categoryIds: [2, 3]
      };

      const response = await request(app)
        .put('/api/articles/1')
        .send(updatedArticle);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1);
      expect(response.body.message).toContain('mis à jour avec succès');
      
      // Vérifier que la transaction a été validée
      expect(clientMock.query).toHaveBeenCalledWith('COMMIT');
    });

    test('Devrait renvoyer 404 si l\'article à mettre à jour n\'existe pas', async () => {
      const clientMock = {
        query: jest.fn(),
        release: jest.fn()
      };
      db.pool.connect.mockResolvedValueOnce(clientMock);
      
      // Simuler qu'aucun article n'est trouvé
      clientMock.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .put('/api/articles/999')
        .send({
          title: 'Article inexistant',
          content: 'Contenu',
          published: false,
          categoryIds: []
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('non trouvé');
      
      // Vérifier que la transaction a été annulée
      expect(clientMock.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('DELETE /api/articles/:id', () => {
    test('Devrait supprimer un article existant', async () => {
      // Simuler la vérification de l'article
      db.query.mockResolvedValueOnce({
        rows: [{ author_id: 1 }]
      });
      // Simuler la suppression
      db.query.mockResolvedValueOnce({
        rows: [{ id: 1 }]
      });

      const response = await request(app).delete('/api/articles/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('supprimé avec succès');
      
      expect(db.query).toHaveBeenCalledTimes(2);
    });

    test('Devrait renvoyer 404 si l\'article à supprimer n\'existe pas', async () => {
      // Simuler qu'aucun article n'est trouvé
      db.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app).delete('/api/articles/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('non trouvé');
    });
  });
});