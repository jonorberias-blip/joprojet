const express = require('express');
const router = express.Router();
const etudiantController = require('../controllers/etudiantController');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken); // Toutes les routes ici nécessitent d'être connecté

router.get('/livres', etudiantController.getLivres);
router.get('/mes-emprunts', etudiantController.getMesEmprunts);
router.get('/mes-reservations', etudiantController.getMesReservations);
router.post('/reserver', etudiantController.reserverLivre);
router.patch('/reserver/:id/annuler', etudiantController.annulerReservation);

module.exports = router;
