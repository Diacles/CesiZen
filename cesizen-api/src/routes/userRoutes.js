const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');
const {
    registerValidation,
    loginValidation,
    resetRequestValidation,
    resetPasswordValidation
} = require('../middlewares/validators');

router.post('/register', registerValidation, userController.register);
router.post('/login', loginValidation, userController.login);
router.post('/forgot-password', resetRequestValidation, userController.forgotPassword);
router.post('/reset-password', resetPasswordValidation, userController.resetPassword);

router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);

router.get('/admin/users', auth, checkRole(['ADMIN']), adminController.getAllUsers);
router.get('/patients', auth, checkRole(['ADMIN', 'PRACTITIONER']), patientController.getPatients);
module.exports = router;