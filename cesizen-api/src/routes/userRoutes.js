const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');
const adminController = require('../controllers/adminController');

const {
    registerValidation,
    loginValidation,
    resetRequestValidation,
    resetPasswordValidation
} = require('../middlewares/validators');

// Routes publiques
router.post('/register', registerValidation, userController.register);
router.post('/login', loginValidation, userController.login);
router.post('/forgot-password', resetRequestValidation, userController.forgotPassword);
router.post('/reset-password', resetPasswordValidation, userController.resetPassword);

// Routes protégées
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);
router.get('/roles', auth, userController.getUserRoles); // Nouvelle route pour les rôles

// Routes admin
router.get('/admin/users', auth, checkRole(['ADMIN']), adminController.getAllUsers);

module.exports = router;