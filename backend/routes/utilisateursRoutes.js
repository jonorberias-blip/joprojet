const express = require('express');
const router = express.Router();
const utilisateursController = require('../controllers/utilisateursController');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, utilisateursController.getUtilisateurs);
router.post('/', authenticateToken, utilisateursController.addUtilisateur);
router.patch('/:id/actif', authenticateToken, utilisateursController.toggleActif);

module.exports = router;
