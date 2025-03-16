const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import des routes
const userRoutes = require('./routes/userRoutes');
const roleRoutes = require('./routes/roleRoutes');
const practitionerRoutes = require('./routes/practitionerRoutes');
const emotionRoutes = require('./routes/emotionRoutes');
// Initialisation de l'application Express
const app = express();

// Middlewares de base
app.use(helmet());  // Sécurité
app.use(cors());    // CORS
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parser JSON

// Route de base pour vérifier que le serveur fonctionne
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Routes de l'API
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/practitioners', practitionerRoutes);
app.use('/api/emotions', emotionRoutes);

// Middleware pour gérer les routes non trouvées
app.use((req, res, next) => {
    res.status(404).json({
    success: false,
    message: 'Route non trouvée'
    });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
    success: false,
    message: 'Une erreur interne est survenue',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Configuration du port
const PORT = process.env.PORT || 3000;

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});