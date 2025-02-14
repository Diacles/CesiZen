const { body, validationResult } = require('express-validator');

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

const registerValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email invalide'),
    body('password')
        .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères')
        .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une majuscule')
        .matches(/[a-z]/).withMessage('Le mot de passe doit contenir au moins une minuscule')
        .matches(/[0-9]/).withMessage('Le mot de passe doit contenir au moins un chiffre')
        .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/)
        .withMessage('Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*()_+-=[]{};\':"\\|,.<>/?`~)'),
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

const loginValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').exists(),
    validateRequest
];

const resetRequestValidation = [
    body('email').isEmail().normalizeEmail(),
    validateRequest
];

const resetPasswordValidation = [
    body('token')
        .isLength({ min: 64, max: 64 })
        .isHexadecimal()
        .withMessage('Token invalide'),
    body('newPassword')
        .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères')
        .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une majuscule')
        .matches(/[a-z]/).withMessage('Le mot de passe doit contenir au moins une minuscule')
        .matches(/[0-9]/).withMessage('Le mot de passe doit contenir au moins un chiffre')
        .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/)
        .withMessage('Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*()_+-=[]{};\':"\\|,.<>/?`~)'),
    validateRequest
];

module.exports = {
    registerValidation,
    loginValidation,
    resetRequestValidation,
    resetPasswordValidation
};