const express = require('express');
const router = express.Router();
const emotionController = require('../controllers/emotionController');
const auth = require('../middlewares/auth');
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

// Protection des routes
router.use(auth);

// Routes pour les émotions
router.get('/categories', emotionController.getEmotionCategories);
router.get('/user', emotionController.getUserEmotions);
router.get('/stats', emotionController.getEmotionStats);

router.post('/', [
    body('emotionId').isInt().withMessage('ID émotion invalide'),
    body('intensity').isInt({min: 1, max: 5}).withMessage('Intensité doit être entre 1 et 5'),
    validateRequest
], emotionController.addEmotion);

router.put('/:id', [
    param('id').isInt().withMessage('ID émotion invalide'),
    body('intensity').isInt({min: 1, max: 5}).withMessage('Intensité doit être entre 1 et 5'),
    validateRequest
], emotionController.updateEmotion);

router.delete('/:id', [
    param('id').isInt().withMessage('ID émotion invalide'),
    validateRequest
], emotionController.deleteEmotion);

module.exports = router;