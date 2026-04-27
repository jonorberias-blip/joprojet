const db = require('../config/db');

exports.getSettings = (req, res) => {
  db.query('SELECT * FROM settings WHERE id = 1', (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur' });
    if (results.length === 0) {
      return res.json({
        email_contact: 'contact@bibliotheque.univ',
        tel_telma: '+261 34 00 000 00',
        tel_orange: '+261 32 00 000 00',
        photo_1: '',
        photo_2: '',
        photo_3: ''
      });
    }
    res.json(results[0]);
  });
};

exports.updateSettings = (req, res) => {
  const { email_contact, tel_telma, tel_orange } = req.body;
  let { photo_1, photo_2, photo_3 } = req.body;

  // Si des fichiers ont été envoyés, on utilise leurs nouveaux chemins
  if (req.files) {
    if (req.files['photo_1']) photo_1 = `/uploads/${req.files['photo_1'][0].filename}`;
    if (req.files['photo_2']) photo_2 = `/uploads/${req.files['photo_2'][0].filename}`;
    if (req.files['photo_3']) photo_3 = `/uploads/${req.files['photo_3'][0].filename}`;
  }

  db.query(
    'INSERT INTO settings (id, email_contact, tel_telma, tel_orange, photo_1, photo_2, photo_3) VALUES (1, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE email_contact=?, tel_telma=?, tel_orange=?, photo_1=?, photo_2=?, photo_3=?',
    [email_contact, tel_telma, tel_orange, photo_1, photo_2, photo_3, email_contact, tel_telma, tel_orange, photo_1, photo_2, photo_3],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erreur lors de la mise à jour' });
      }
      res.json({ message: 'Paramètres mis à jour' });
    }
  );
};
