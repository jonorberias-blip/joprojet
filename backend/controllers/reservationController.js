const db = require('../config/db');

exports.getReservations = (req, res) => {
  const query = `
    SELECT r.*, m.nom as membre_nom, m.prenom as membre_prenom, l.titre as livre_titre
    FROM reservations r
    JOIN membres m ON r.membre_id = m.id
    JOIN livres l ON r.livre_id = l.id
    ORDER BY r.date_reservation DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur' });
    res.json(results);
  });
};

exports.addReservation = (req, res) => {
  const { membre_id, livre_id, date_recuperation, date_retour } = req.body;
  
  db.beginTransaction(err => {
    if (err) return res.status(500).json({ message: 'Erreur transaction' });

    db.query(
      'INSERT INTO reservations (membre_id, livre_id, date_recuperation, date_retour_prevue) VALUES (?, ?, ?, ?)',
      [membre_id, livre_id, date_recuperation, date_retour],
      (err) => {
        if (err) return db.rollback(() => res.status(500).json({ message: 'Erreur insertion réservation' }));

        db.query('UPDATE livres SET disponibles = disponibles - 1 WHERE id = ?', [livre_id], (err) => {
          if (err) return db.rollback(() => res.status(500).json({ message: 'Erreur mise à jour stock' }));

          db.commit(err => {
            if (err) return db.rollback(() => res.status(500).json({ message: 'Erreur commit' }));
            res.status(201).json({ message: 'Réservation enregistrée et stock mis à jour' });
          });
        });
      }
    );
  });
};

exports.annulerReservation = (req, res) => {
  const reservationId = req.params.id;
  
  db.query('SELECT livre_id, statut FROM reservations WHERE id = ?', [reservationId], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ message: 'Réservation non trouvée' });
    const { livre_id, statut } = results[0];

    // Si déjà annulée, on ne fait rien de plus
    if (statut === 'annulee') return res.json({ message: 'Réservation déjà annulée' });

    db.beginTransaction(err => {
      if (err) return res.status(500).json({ message: 'Erreur transaction' });

      db.query('UPDATE reservations SET statut = "annulee" WHERE id = ?', [reservationId], (err) => {
        if (err) return db.rollback(() => res.status(500).json({ message: 'Erreur lors de l\'annulation' }));

        // On ne rend le livre au stock QUE si la réservation était en attente
        if (statut === 'en_attente') {
          db.query('UPDATE livres SET disponibles = disponibles + 1 WHERE id = ?', [livre_id], (err) => {
            if (err) return db.rollback(() => res.status(500).json({ message: 'Erreur mise à jour stock' }));
            
            db.commit(err => {
              if (err) return db.rollback(() => res.status(500).json({ message: 'Erreur commit' }));
              console.log(`Stock augmenté pour le livre ID ${livre_id} (Réservation refusée)`);
              res.json({ message: 'Réservation refusée et livre rendu au stock' });
            });
          });
        } else {
          // Si le statut était "satisfaite", le livre est déjà dans les emprunts, donc on ne touche pas au stock des livres disponibles
          db.commit(err => {
            if (err) return db.rollback(() => res.status(500).json({ message: 'Erreur commit' }));
            res.json({ message: 'Réservation annulée (le stock n\'a pas bougé car déjà traité)' });
          });
        }
      });
    });
  });
};

exports.validerReservation = (req, res) => {
  const reservationId = req.params.id;

  db.query('SELECT * FROM reservations WHERE id = ?', [reservationId], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ message: 'Réservation non trouvée' });
    const resv = results[0];

    if (resv.statut !== 'en_attente') return res.status(400).json({ message: 'Cette réservation n\'est plus en attente' });

    db.beginTransaction(err => {
      if (err) return res.status(500).json({ message: 'Erreur transaction' });

      db.query('UPDATE reservations SET statut = "satisfaite" WHERE id = ?', [reservationId], (err) => {
        if (err) return db.rollback(() => res.status(500).json({ message: 'Erreur mise à jour réservation' }));

        const date_retour = resv.date_retour_prevue || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
        db.query(
          'INSERT INTO emprunts (membre_id, livre_id, date_retour_prevue, statut) VALUES (?, ?, ?, "en_cours")',
          [resv.membre_id, resv.livre_id, date_retour],
          (err) => {
            if (err) return db.rollback(() => res.status(500).json({ message: 'Erreur création emprunt' }));

            // NOTE : On ne diminue plus le stock ici car il a été diminué lors de la création de la réservation
            db.commit(err => {
              if (err) return db.rollback(() => res.status(500).json({ message: 'Erreur commit' }));
              res.json({ message: 'Réservation validée et emprunt créé !' });
            });
          }
        );
      });
    });
  });
};
