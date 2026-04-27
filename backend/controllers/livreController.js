const db = require('../config/db');

exports.getLivres = (req, res) => {
  const { search, disponible } = req.query;
  let query = 'SELECT * FROM livres';
  const params = [];

  if (search || disponible) {
    query += ' WHERE 1=1';
    if (search) {
      query += ' AND (titre LIKE ? OR auteur LIKE ? OR isbn LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (disponible === 'true') {
      query += ' AND disponibles > 0';
    }
  }

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur' });
    res.json(results);
  });
};

exports.addLivre = (req, res) => {
  const { titre, auteur, isbn, annee, categorie, exemplaires, resume } = req.body;
  const photo_url = req.file ? `/uploads/${req.file.filename}` : null;

  db.query(
    'INSERT INTO livres (titre, auteur, isbn, annee, categorie, exemplaires, disponibles, photo_url, resume) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [titre, auteur, isbn, annee, categorie, exemplaires, exemplaires, photo_url, resume],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erreur lors de l\'ajout' });
      }
      res.status(201).json({ message: 'Livre ajouté' });
    }
  );
};

exports.updateLivre = (req, res) => {
  const { titre, auteur, isbn, annee, categorie, exemplaires, resume } = req.body;
  let query = 'UPDATE livres SET titre=?, auteur=?, isbn=?, annee=?, categorie=?, exemplaires=?, resume=?';
  let params = [titre, auteur, isbn, annee, categorie, exemplaires, resume];

  if (req.file) {
    const photo_url = `/uploads/${req.file.filename}`;
    query += ', photo_url=?';
    params.push(photo_url);
  }

  query += ' WHERE id=?';
  params.push(req.params.id);

  db.query(query, params, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur lors de la modification' });
    }
    res.json({ message: 'Livre mis à jour' });
  });
};

exports.deleteLivre = (req, res) => {
  db.query('DELETE FROM livres WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'Erreur lors de la suppression' });
    res.json({ message: 'Livre supprimé' });
  });
};
