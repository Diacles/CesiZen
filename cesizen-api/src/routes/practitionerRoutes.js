const express = require('express');
const router = express.Router();
const practitionerController = require('../controllers/practitionerController');
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

// Protection des routes
router.use(auth, checkRole(['PRACTITIONER']));

// Validation pour les notes
const noteValidation = [
    body('patientId').isInt().withMessage('ID patient invalide'),
    body('content').notEmpty().trim().withMessage('Contenu requis'),
    body('category').isIn(['CONSULTATION', 'SUIVI', 'PRESCRIPTION', 'AUTRE'])
        .withMessage('Catégorie invalide'),
    validateRequest
];

// Routes
router.get('/patients', practitionerController.getPatients);

router.post('/patients', [
    body('patientId').isInt().withMessage('ID patient invalide'),
    validateRequest
], practitionerController.addPatient);

router.get('/patients/:patientId/notes', [
    param('patientId').isInt().withMessage('ID patient invalide'),
    validateRequest
], practitionerController.getPatientNotes);

router.post('/notes', noteValidation, practitionerController.addFollowUpNote);

module.exports = router;