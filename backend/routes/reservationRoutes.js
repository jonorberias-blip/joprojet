const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, reservationController.getReservations);
router.post('/', authenticateToken, reservationController.addReservation);
router.patch('/:id/annuler', authenticateToken, reservationController.annulerReservation);
router.patch('/:id/valider', authenticateToken, reservationController.validerReservation);

module.exports = router;
