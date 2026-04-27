const mysql = require('mysql2');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  port: process.env.DB_PORT || 3306,
  password: process.env.DB_PASSWORD || '',
  ssl: {
    rejectUnauthorized: true
  }
};

const connection = mysql.createConnection(dbConfig);

connection.connect(err => {
  if (err) {
    console.error('Erreur de connexion MySQL:', err);
    return;
  }
  console.log('Connecté à MySQL.');
  
  const dbName = process.env.DB_NAME || 'bibliotheque';
  connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`, (err) => {
    if (err) {
      console.error('Erreur lors de la création de la base de données:', err);
      return;
    }
    console.log(`Base de données "${dbName}" vérifiée/créée.`);
    
    connection.changeUser({ database: dbName }, (err) => {
      if (err) {
        console.error('Erreur lors du changement de base de données:', err);
        return;
      }
      initializeDatabase(connection);
    });
  });
});

function initializeDatabase(dbConn) {
  const queries = [
    `CREATE TABLE IF NOT EXISTS utilisateurs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nom VARCHAR(100),
      prenom VARCHAR(100),
      email VARCHAR(100) UNIQUE,
      mot_de_passe VARCHAR(255),
      role ENUM('admin', 'bibliothecaire') DEFAULT 'bibliothecaire',
      actif BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS livres (
      id INT AUTO_INCREMENT PRIMARY KEY,
      titre VARCHAR(255),
      auteur VARCHAR(255),
      isbn VARCHAR(50) UNIQUE,
      annee INT,
      categorie VARCHAR(100),
      exemplaires INT DEFAULT 1,
      disponibles INT DEFAULT 1,
      photo_url VARCHAR(255),
      resume TEXT
    )`,
    `ALTER TABLE livres ADD COLUMN IF NOT EXISTS photo_url VARCHAR(255)`,
    `ALTER TABLE livres ADD COLUMN IF NOT EXISTS resume TEXT`,
    `CREATE TABLE IF NOT EXISTS membres (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nom VARCHAR(100),
      prenom VARCHAR(100),
      email VARCHAR(100) UNIQUE,
      numero_carte VARCHAR(50) UNIQUE,
      mot_de_passe VARCHAR(255),
      telephone VARCHAR(20),
      adresse VARCHAR(255),
      ecole_faculte VARCHAR(100),
      niveau VARCHAR(50),
      parcours VARCHAR(100),
      motivation TEXT,
      photo_url VARCHAR(255),
      document_pdf_url VARCHAR(255),
      droit_paye BOOLEAN DEFAULT FALSE,
      note_confiance INT DEFAULT 100,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS emprunts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      livre_id INT,
      membre_id INT,
      date_emprunt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      date_retour_prevue TIMESTAMP,
      date_retour_effective TIMESTAMP NULL,
      statut ENUM('en_cours', 'retourne', 'en_retard') DEFAULT 'en_cours',
      FOREIGN KEY (livre_id) REFERENCES livres(id),
      FOREIGN KEY (membre_id) REFERENCES membres(id)
    )`,
    `CREATE TABLE IF NOT EXISTS reservations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      livre_id INT,
      membre_id INT,
      date_reservation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      date_recuperation TIMESTAMP NULL,
      date_retour_prevue TIMESTAMP NULL,
      statut ENUM('en_attente', 'satisfaite', 'annulee') DEFAULT 'en_attente',
      FOREIGN KEY (livre_id) REFERENCES livres(id),
      FOREIGN KEY (membre_id) REFERENCES membres(id)
    )`,
    `CREATE TABLE IF NOT EXISTS sanctions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      membre_id INT,
      motif VARCHAR(255),
      points_perdus INT,
      date_sanction TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (membre_id) REFERENCES membres(id)
    )`,
    `CREATE TABLE IF NOT EXISTS settings (
      id INT PRIMARY KEY DEFAULT 1,
      email_contact VARCHAR(100),
      tel_telma VARCHAR(20),
      tel_orange VARCHAR(20),
      photo_1 TEXT,
      photo_2 TEXT,
      photo_3 TEXT
    )`
  ];

  queries.forEach(q => dbConn.query(q, err => { if (err) console.error('Erreur lors de la création des tables:', err); }));
}

module.exports = connection;
