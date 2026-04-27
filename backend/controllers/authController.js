const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = (req, res) => {
  const { email, mot_de_passe } = req.body;
  db.query('SELECT * FROM utilisateurs WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur' });
    if (results.length === 0) return res.status(401).json({ message: 'Identifiants incorrects' });

    const user = results[0];
    const match = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!match) return res.status(401).json({ message: 'Identifiants incorrects' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user.id, nom: user.nom, email: user.email, role: user.role } });
  });
};

exports.loginEtudiant = (req, res) => {
  const { email, mot_de_passe } = req.body;
  db.query('SELECT * FROM membres WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur' });
    if (results.length === 0 || !results[0].mot_de_passe) return res.status(401).json({ message: 'Identifiants incorrects' });

    const user = results[0];
    const match = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!match) return res.status(401).json({ message: 'Identifiants incorrects' });

    const token = jwt.sign({ id: user.id, email: user.email, role: 'etudiant' }, process.env.JWT_SECRET);
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        nom: user.nom, 
        prenom: user.prenom, 
        email: user.email, 
        droit_paye: user.droit_paye,
        photo_url: user.photo_url,
        role: 'etudiant' 
      } 
    });
  });
};

exports.registerEtudiant = async (req, res) => {
  const { nom, prenom, email, mot_de_passe, telephone, adresse, ecole_faculte, niveau, parcours, matricule, motivation } = req.body;
  const hash = await bcrypt.hash(mot_de_passe, 10);

  const photo_url = req.files['photo'] ? `/uploads/${req.files['photo'][0].filename}` : null;
  const document_pdf_url = req.files['documentPdf'] ? `/uploads/${req.files['documentPdf'][0].filename}` : null;

  db.query(
    'INSERT INTO membres (nom, prenom, email, mot_de_passe, telephone, adresse, ecole_faculte, niveau, parcours, numero_carte, motivation, photo_url, document_pdf_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [nom, prenom, email, hash, telephone, adresse, ecole_faculte, niveau, parcours, matricule, motivation, photo_url, document_pdf_url],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erreur lors de l\'inscription' });
      }
      res.status(201).json({ message: 'Inscription réussie' });
    }
  );
};

exports.getMe = (req, res) => {
  if (req.user.role === 'etudiant') {
    db.query('SELECT id, nom, prenom, email, numero_carte, droit_paye, photo_url FROM membres WHERE id = ?', [req.user.id], (err, results) => {
      if (err || results.length === 0) return res.status(404).json({ message: 'Utilisateur non trouvé' });
      res.json({ ...results[0], role: 'etudiant' });
    });
  } else {
    db.query('SELECT id, nom, email, role FROM utilisateurs WHERE id = ?', [req.user.id], (err, results) => {
      if (err || results.length === 0) return res.status(404).json({ message: 'Utilisateur non trouvé' });
      res.json(results[0]);
    });
  }
};
