const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getMembres = (req, res) => {
  const { search } = req.query;
  let query = 'SELECT * FROM membres';
  const params = [];

  if (search) {
    query += ' WHERE nom LIKE ? OR prenom LIKE ? OR email LIKE ? OR numero_carte LIKE ?';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur' });
    res.json(results);
  });
};

exports.addMembre = async (req, res) => {
  const { nom, prenom, email, numero_carte, mot_de_passe, droit_paye } = req.body;
  const hash = mot_de_passe ? await bcrypt.hash(mot_de_passe, 10) : null;

  db.query(
    'INSERT INTO membres (nom, prenom, email, numero_carte, mot_de_passe, droit_paye) VALUES (?, ?, ?, ?, ?, ?)',
    [nom, prenom, email, numero_carte, hash, droit_paye],
    (err) => {
      if (err) return res.status(500).json({ message: 'Erreur lors de l\'ajout' });
      res.status(201).json({ message: 'Membre ajouté' });
    }
  );
};

exports.updateMembre = async (req, res) => {
  const { nom, prenom, email, numero_carte, mot_de_passe, droit_paye } = req.body;
  let query = 'UPDATE membres SET nom=?, prenom=?, email=?, numero_carte=?, droit_paye=?';
  let params = [nom, prenom, email, numero_carte, droit_paye];

  if (mot_de_passe && mot_de_passe.trim() !== '') {
    const hash = await bcrypt.hash(mot_de_passe, 10);
    query += ', mot_de_passe=?';
    params.push(hash);
  }

  query += ' WHERE id=?';
  params.push(req.params.id);

  db.query(query, params, (err) => {
    if (err) return res.status(500).json({ message: 'Erreur lors de la modification' });
    res.json({ message: 'Membre mis à jour' });
  });
};

exports.deleteMembre = (req, res) => {
  db.query('DELETE FROM membres WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'Erreur lors de la suppression' });
    res.json({ message: 'Membre supprimé' });
  });
};

exports.addSanction = (req, res) => {
  const { motif, points_perdus } = req.body;
  db.query(
    'INSERT INTO sanctions (membre_id, motif, points_perdus) VALUES (?, ?, ?)',
    [req.params.id, motif, points_perdus],
    (err) => {
      if (err) return res.status(500).json({ message: 'Erreur lors de la sanction' });
      res.status(201).json({ message: 'Sanction appliquée' });
    }
  );
};
