const db = require('../config/db');

exports.getLivres = (req, res) => {
  const { search } = req.query;
  let query = 'SELECT * FROM livres';
  const params = [];
  if (search) {
    query += ' WHERE titre LIKE ? OR auteur LIKE ? OR isbn LIKE ? OR categorie LIKE ?';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }
  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur' });
    res.json(results);
  });
};

exports.getMesEmprunts = (req, res) => {
  const query = `
    SELECT e.*, l.titre, l.auteur
    FROM emprunts e
    JOIN livres l ON e.livre_id = l.id
    WHERE e.membre_id = ?
    ORDER BY e.date_emprunt DESC
  `;
  db.query(query, [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur' });
    res.json(results);
  });
};

exports.getMesReservations = (req, res) => {
  const query = `
    SELECT r.*, l.titre, l.auteur
    FROM reservations r
    JOIN livres l ON r.livre_id = l.id
    WHERE r.membre_id = ?
    ORDER BY r.date_reservation DESC
  `;
  db.query(query, [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur' });
    res.json(results);
  });
};

exports.reserverLivre = (req, res) => {
  const { livre_id, date_recuperation, date_retour_prevue } = req.body;
  
  db.beginTransaction(err => {
    if (err) return res.status(500).json({ message: 'Erreur transaction' });

    db.query(
      'INSERT INTO reservations (membre_id, livre_id, date_recuperation, date_retour_prevue) VALUES (?, ?, ?, ?)',
      [req.user.id, livre_id, date_recuperation, date_retour_prevue],
      (err) => {
        if (err) return db.rollback(() => res.status(500).json({ message: 'Erreur lors de la réservation' }));

        db.query('UPDATE livres SET disponibles = disponibles - 1 WHERE id = ?', [livre_id], (err) => {
          if (err) return db.rollback(() => res.status(500).json({ message: 'Erreur mise à jour stock' }));

          db.commit(err => {
            if (err) return db.rollback(() => res.status(500).json({ message: 'Erreur commit' }));
            res.status(201).json({ message: 'Réservation effectuée' });
          });
        });
      }
    );
  });
};

exports.annulerReservation = (req, res) => {
  const reservationId = req.params.id;

  db.query('SELECT livre_id, statut FROM reservations WHERE id = ? AND membre_id = ?', [reservationId, req.user.id], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ message: 'Réservation non trouvée' });
    const { livre_id, statut } = results[0];

    if (statut === 'annulee') return res.json({ message: 'Réservation déjà annulée' });

    db.beginTransaction(err => {
      if (err) return res.status(500).json({ message: 'Erreur transaction' });

      db.query('UPDATE reservations SET statut = "annulee" WHERE id = ?', [reservationId], (err) => {
        if (err) return db.rollback(() => res.status(500).json({ message: 'Erreur lors de l\'annulation' }));

        if (statut === 'en_attente') {
          db.query('UPDATE livres SET disponibles = disponibles + 1 WHERE id = ?', [livre_id], (err) => {
            if (err) return db.rollback(() => res.status(500).json({ message: 'Erreur mise à jour stock' }));

            db.commit(err => {
              if (err) return db.rollback(() => res.status(500).json({ message: 'Erreur commit' }));
              console.log(`Stock augmenté pour le livre ID ${livre_id} (Annulé par l'étudiant)`);
              res.json({ message: 'Réservation annulée et livre rendu au stock' });
            });
          });
        } else {
          db.commit(err => {
            if (err) return db.rollback(() => res.status(500).json({ message: 'Erreur commit' }));
            res.json({ message: 'Réservation annulée (le stock n\'a pas bougé car déjà traité)' });
          });
        }
      });
    });
  });
};
