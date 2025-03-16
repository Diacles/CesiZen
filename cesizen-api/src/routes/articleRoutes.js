const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');
const { body, param, validationResult } = require('express-validator');

// Middleware de validation
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false, 
            errors: errors.array() 
        });
    }
    next();
};

// Validation pour les articles
const articleValidation = [
    body('title').notEmpty().trim().isLength({ min: 5, max: 255 })
        .withMessage('Le titre doit contenir entre 5 et 255 caractères'),
    body('summary').optional().trim().isLength({ max: 500 })
        .withMessage('Le résumé ne peut pas dépasser 500 caractères'),
    body('content').notEmpty().trim()
        .withMessage('Le contenu est requis'),
    body('imageUrl').optional().isURL()
        .withMessage('L\'URL de l\'image doit être valide'),
    body('published').isBoolean()
        .withMessage('Le statut de publication doit être un booléen'),
    body('categoryIds').isArray()
        .withMessage('Les catégories doivent être fournies sous forme de tableau'),
    validateRequest
];

// Routes publiques
router.get('/', articleController.getAllArticles);
router.get('/categories', articleController.getCategories);

// Routes administrateur - PLACÉES AVANT LA ROUTE AVEC PARAMÈTRE
router.get('/admin', auth, checkRole(['ADMIN']), articleController.getAdminArticles);
router.get('/admin/:id', auth, checkRole(['ADMIN']), articleController.getArticleById);

// Route avec paramètre placée après les routes plus spécifiques
router.get('/:slug', articleController.getArticleBySlug);

// Autres routes admin
router.post('/', auth, checkRole(['ADMIN']), articleValidation, articleController.createArticle);
router.put('/:id', auth, checkRole(['ADMIN']), articleValidation, articleController.updateArticle);
router.delete('/:id', auth, checkRole(['ADMIN']), articleController.deleteArticle);

module.exports = router;