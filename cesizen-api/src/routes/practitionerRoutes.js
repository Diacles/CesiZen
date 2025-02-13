const express = require('express');
const router = express.Router();
const practitionerController = require('../controllers/practitionerController');
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');
const { body, param } = require('express-validator');
const { validateRequest } = require('../middlewares/validators');

// Protection des routes : authentification + rôle PRACTITIONER
router.use(auth, checkRole(['PRACTITIONER']));

// Validation pour l'ajout de notes
const noteValidation = [
    body('content').notEmpty().trim().escape(),
    body('category').isIn(['CONSULTATION', 'SUIVI', 'PRESCRIPTION', 'AUTRE']),
    validateRequest
];

// Routes
router.get('/patients', practitionerController.getPatients);
router.post('/patients', 
    body('patientId').isInt(),
    validateRequest,
    practitionerController.addPatient
);

router.get('/patients/:patientId/notes',
    param('patientId').isInt(),
    validateRequest,
    practitionerController.getPatientNotes
);

router.post('/notes',
    noteValidation,
    practitionerController.addFollowUpNote
);

module.exports = router;