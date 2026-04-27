const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getUtilisateurs = (req, res) => {
  db.query('SELECT id, nom, prenom, email, role, actif FROM utilisateurs', (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur' });
    res.json(results);
  });
};

exports.addUtilisateur = async (req, res) => {
  const { nom, prenom, email, mot_de_passe, role } = req.body;
  const hash = await bcrypt.hash(mot_de_passe, 10);
  db.query(
    'INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role) VALUES (?, ?, ?, ?, ?)',
    [nom, prenom, email, hash, role],
    (err) => {
      if (err) return res.status(500).json({ message: 'Erreur lors de la création' });
      res.status(201).json({ message: 'Utilisateur créé' });
    }
  );
};

exports.toggleActif = (req, res) => {
  db.query('UPDATE utilisateurs SET actif = NOT actif WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'Erreur' });
    res.json({ message: 'Statut mis à jour' });
  });
};
