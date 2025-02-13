const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Initialisation de l'application Express
const app = express();

// Middlewares de base
app.use(helmet());  // Sécurité
app.use(cors());    // CORS
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parser JSON (comme [FromBody] en C#)

// Routes de base
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
    error: 'Une erreur interne est survenue',
    timestamp: new Date()
    });
});

// Configuration du port
const PORT = process.env.PORT || 3000;

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});