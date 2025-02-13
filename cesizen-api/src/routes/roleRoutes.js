const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');
const roleValidators = require('../middlewares/roleValidators');

// Protection des routes
router.use(auth, checkRole(['ADMIN']));

// Routes de gestion des rôles
router.post('/assign', roleValidators.assignRole, roleController.assignRole);
router.post('/remove', roleValidators.removeRole, roleController.removeRole);
router.get('/user/:userId', roleValidators.getUserRoles, roleController.getUserRoles);
router.get('/all', roleController.getAllRoles);

module.exports = router;