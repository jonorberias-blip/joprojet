const express = require('express');
const router = express.Router();
const livreController = require('../controllers/livreController');
const authenticateToken = require('../middleware/auth');

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.get('/', livreController.getLivres);
router.post('/', authenticateToken, upload.single('photo'), livreController.addLivre);
router.put('/:id', authenticateToken, upload.single('photo'), livreController.updateLivre);
router.delete('/:id', authenticateToken, livreController.deleteLivre);

module.exports = router;
