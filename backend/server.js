const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Routes imports
const authRoutes = require('./routes/authRoutes');
const livreRoutes = require('./routes/livreRoutes');
const membreRoutes = require('./routes/membreRoutes');
const empruntRoutes = require('./routes/empruntRoutes');
const statsRoutes = require('./routes/statsRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const utilisateursRoutes = require('./routes/utilisateursRoutes');
const etudiantRoutes = require('./routes/etudiantRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/livres', livreRoutes);
app.use('/api/membres', membreRoutes);
app.use('/api/emprunts', empruntRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/utilisateurs', utilisateursRoutes);
app.use('/api/etudiant', etudiantRoutes);

const PORT = process.env.PORT || 8880;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
