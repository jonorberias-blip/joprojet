const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

const connection = mysql.createConnection(dbConfig);

async function seed() {
  const dbName = process.env.DB_NAME || 'bibliotheque';
  
  connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`, async (err) => {
    if (err) return console.error(err);
    
    connection.changeUser({ database: dbName }, async (err) => {
      if (err) return console.error(err);

      const password = await bcrypt.hash('admin123', 10);
      const admin = {
        nom: 'ADMIN',
        prenom: 'Principal',
        email: 'admin@library.com',
        mot_de_passe: password,
        role: 'admin'
      };

      connection.query('INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE mot_de_passe=VALUES(mot_de_passe)', 
        [admin.nom, admin.prenom, admin.email, admin.mot_de_passe, admin.role], 
        (err) => {
          if (err) console.error('Erreur lors du seeding:', err);
          else console.log('Admin créé avec succès (email: admin@library.com, mdp: admin123)');
          connection.end();
        }
      );
    });
  });
}

seed();
