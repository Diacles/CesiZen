const { body, param, validationResult } = require('express-validator');

// Définition de validateRequest localement
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

const roleValidators = {
    assignRole: [
        body('userId').isInt(),
        body('roleName').isIn(['ADMIN', 'PRACTITIONER', 'USER']),
        validateRequest
    ],
    removeRole: [
        body('userId').isInt(),
        body('roleName').isIn(['ADMIN', 'PRACTITIONER', 'USER']),
        validateRequest
    ],
    getUserRoles: [
        param('userId').isInt(),
        validateRequest
    ]
};

module.exports = roleValidators;