const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const authenticateToken = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, 'setting_' + file.fieldname + '_' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.get('/', settingsController.getSettings);
router.put('/', authenticateToken, upload.fields([
  { name: 'photo_1', maxCount: 1 },
  { name: 'photo_2', maxCount: 1 },
  { name: 'photo_3', maxCount: 1 }
]), settingsController.updateSettings);

module.exports = router;
