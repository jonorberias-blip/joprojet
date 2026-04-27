const db = require('../config/db');

exports.getEmprunts = (req, res) => {
  const { statut, search } = req.query;
  let query = `
    SELECT e.*, m.nom as membre_nom, m.prenom as membre_prenom, m.numero_carte, l.titre as livre_titre, l.isbn
    FROM emprunts e
    JOIN membres m ON e.membre_id = m.id
    JOIN livres l ON e.livre_id = l.id
    WHERE 1=1
  `;
  const params = [];

  if (statut) {
    query += ' AND e.statut = ?';
    params.push(statut);
  }
  if (search) {
    query += ' AND (m.nom LIKE ? OR m.prenom LIKE ? OR m.numero_carte LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur' });
    res.json(results);
  });
};

exports.getRetards = (req, res) => {
  const query = `
    SELECT e.*, m.nom as membre_nom, m.prenom as membre_prenom, m.email as membre_email, l.titre as livre_titre,
           DATEDIFF(NOW(), e.date_retour_prevue) as jours_retard
    FROM emprunts e
    JOIN membres m ON e.membre_id = m.id
    JOIN livres l ON e.livre_id = l.id
    WHERE e.statut = 'en_cours' AND e.date_retour_prevue < NOW()
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur' });
    res.json(results);
  });
};

exports.addEmprunt = (req, res) => {
  const { membre_id, livre_id } = req.body;
  
  db.query('SELECT droit_paye FROM membres WHERE id = ?', [membre_id], (err, results) => {
    if (err || results.length === 0) return res.status(500).json({ message: 'Membre non trouvé' });
    if (!results[0].droit_paye) return res.status(403).json({ message: 'Le membre n\'a pas payé son droit annuel' });

    db.query('SELECT disponibles FROM livres WHERE id = ?', [livre_id], (err, results) => {
      if (err || results.length === 0) return res.status(500).json({ message: 'Livre non trouvé' });
      if (results[0].disponibles <= 0) return res.status(400).json({ message: 'Livre non disponible' });

      const date_retour_prevue = new Date();
      date_retour_prevue.setDate(date_retour_prevue.getDate() + 14);

      db.beginTransaction(err => {
        if (err) return res.status(500).json({ message: 'Erreur transaction' });
        db.query('INSERT INTO emprunts (membre_id, livre_id, date_retour_prevue) VALUES (?, ?, ?)', [membre_id, livre_id, date_retour_prevue], (err) => {
          if (err) return db.rollback(() => res.status(500).json({ message: 'Erreur insertion emprunt' }));
          db.query('UPDATE livres SET disponibles = disponibles - 1 WHERE id = ?', [livre_id], (err) => {
            if (err) return db.rollback(() => res.status(500).json({ message: 'Erreur mise à jour livre' }));
            db.commit(err => {
              if (err) return db.rollback(() => res.status(500).json({ message: 'Erreur commit' }));
              res.status(201).json({ message: 'Emprunt enregistré' });
            });
          });
        });
      });
    });
  });
};

exports.retourEmprunt = (req, res) => {
  db.query('SELECT livre_id FROM emprunts WHERE id = ?', [req.params.id], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ message: 'Emprunt non trouvé' });
    const livre_id = results[0].livre_id;

    db.beginTransaction(err => {
      if (err) return res.status(500).json({ message: 'Erreur transaction' });
      db.query('UPDATE emprunts SET date_retour_effective = NOW(), statut = "retourne" WHERE id = ?', [req.params.id], (err) => {
        if (err) return db.rollback(() => res.status(500).json({ message: 'Erreur mise à jour emprunt' }));
        db.query('UPDATE livres SET disponibles = disponibles + 1 WHERE id = ?', [livre_id], (err) => {
          if (err) return db.rollback(() => res.status(500).json({ message: 'Erreur mise à jour livre' }));
          db.commit(err => {
            if (err) return db.rollback(() => res.status(500).json({ message: 'Erreur commit' }));
            res.json({ message: 'Livre retourné', reservation_en_attente: false });
          });
        });
      });
    });
  });
};
