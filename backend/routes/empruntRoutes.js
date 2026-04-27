const express = require('express');
const router = express.Router();
const empruntController = require('../controllers/empruntController');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, empruntController.getEmprunts);
router.get('/retards', authenticateToken, empruntController.getRetards);
router.post('/', authenticateToken, empruntController.addEmprunt);
router.patch('/:id/retour', authenticateToken, empruntController.retourEmprunt);

module.exports = router;
