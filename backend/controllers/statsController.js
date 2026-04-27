const db = require('../config/db');

exports.getStats = (req, res) => {
  const stats = {};
  
  const q1 = 'SELECT COUNT(*) as total FROM livres';
  const q2 = 'SELECT COUNT(*) as total FROM membres';
  const q3 = 'SELECT COUNT(*) as total FROM emprunts WHERE statut = "en_cours"';
  const q4 = 'SELECT COUNT(*) as total FROM emprunts WHERE statut = "en_cours" AND date_retour_prevue < NOW()';
  
  const q5 = `
    SELECT l.titre, l.auteur, COUNT(e.id) as nb_emprunts
    FROM emprunts e
    JOIN livres l ON e.livre_id = l.id
    GROUP BY l.id
    ORDER BY nb_emprunts DESC
    LIMIT 5
  `;
  
  const q6 = `
    SELECT DATE_FORMAT(date_emprunt, '%Y-%m') as mois, COUNT(*) as nb
    FROM emprunts
    GROUP BY mois
    ORDER BY mois DESC
    LIMIT 6
  `;

  Promise.all([
    new Promise(resolve => db.query(q1, (err, r) => resolve(r[0].total))),
    new Promise(resolve => db.query(q2, (err, r) => resolve(r[0].total))),
    new Promise(resolve => db.query(q3, (err, r) => resolve(r[0].total))),
    new Promise(resolve => db.query(q4, (err, r) => resolve(r[0].total))),
    new Promise(resolve => db.query(q5, (err, r) => resolve(r))),
    new Promise(resolve => db.query(q6, (err, r) => resolve(r))),
  ]).then(([total_livres, total_membres, emprunts_en_cours, retards, livres_populaires, emprunts_par_mois]) => {
    res.json({
      total_livres,
      total_membres,
      emprunts_en_cours,
      retards,
      livres_populaires,
      emprunts_par_mois
    });
  }).catch(err => res.status(500).json({ message: 'Erreur stats' }));
};
