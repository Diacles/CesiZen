// Enregistrer ce fichier à la racine de votre projet
// Pour tester uniquement la connexion à la base de données
require('dotenv').config();
const { Pool } = require('pg');

// Afficher les configurations utilisées (sans le mot de passe complet)
console.log('Configuration de connexion:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD type:', typeof process.env.DB_PASSWORD);
console.log('DB_PASSWORD length:', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0);
console.log('DB_PASSWORD preview:', process.env.DB_PASSWORD ? `${process.env.DB_PASSWORD.substring(0, 1)}...` : 'undefined');

// Créer une instance de Pool avec les configurations explicites
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  // Désactiver SSL en développement
  ssl: process.env.NODE_ENV === 'production'
});

// Fonction de test de connexion
async function testConnection() {
  try {
    // Tester la connexion
    const client = await pool.connect();
    console.log('Connexion à la base de données réussie!');
    
    // Exécuter une requête simple
    const result = await client.query('SELECT current_timestamp');
    console.log('Résultat de la requête:', result.rows[0]);
    
    // Libérer le client
    client.release();
    console.log('Test terminé avec succès');
  } catch (error) {
    console.error('Erreur lors de la connexion à la base de données:', error);
  } finally {
    // Fermer le pool
    await pool.end();
  }
}

// Exécuter le test
testConnection();