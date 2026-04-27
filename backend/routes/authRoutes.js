const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.post('/login', authController.login);
router.post('/login-etudiant', authController.loginEtudiant);
router.post('/register-etudiant', upload.fields([{ name: 'photo' }, { name: 'documentPdf' }]), authController.registerEtudiant);
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;
