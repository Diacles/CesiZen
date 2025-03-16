const { body, validationResult } = require('express-validator');

// Middleware pour vérifier les erreurs de validation
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

// Validation pour l'inscription
const registerValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email invalide'),
    body('password')
        .isLength({ min: 8 })
        .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/)
        .withMessage('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial'),
    body('firstName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Le prénom doit contenir entre 2 et 50 caractères'),
    body('lastName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
    validateRequest
];

// Validation pour la connexion
const loginValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').exists(),
    validateRequest
];

// Validation pour la demande de réinitialisation
const resetRequestValidation = [
    body('email').isEmail().normalizeEmail(),
    validateRequest
];

// Validation pour la réinitialisation du mot de passe
const resetPasswordValidation = [
    body('token')
        .isLength({ min: 64, max: 64 })
        .isHexadecimal()
        .withMessage('Token invalide'),
    body('newPassword')
        .isLength({ min: 8 })
        .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/)
        .withMessage('Nouveau mot de passe invalide'),
    validateRequest
];

module.exports = {
    registerValidation,
    loginValidation,
    resetRequestValidation,
    resetPasswordValidation
};