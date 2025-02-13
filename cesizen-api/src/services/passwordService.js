const crypto = require('crypto');
const db = require('../config/database');
const emailService = require('./emailService');
const bcrypt = require('bcryptjs');

const passwordService = {
    async createResetToken(userId, email, firstName) {
        // Générer un token cryptographiquement sûr
        const token = crypto.randomBytes(32).toString('hex');
        
        // Calculer la date d'expiration (1 heure)
        const expiresAt = new Date(Date.now() + 3600000);

        // Invalider les anciens tokens non utilisés
        await db.query(
            `UPDATE password_reset_tokens 
            SET used_at = CURRENT_TIMESTAMP 
            WHERE user_id = $1 AND used_at IS NULL`,
            [userId]
        );

        // Créer un nouveau token
        await db.query(
            `INSERT INTO password_reset_tokens (user_id, token, expires_at)
            VALUES ($1, $2, $3)`,
            [userId, token, expiresAt]
        );

        // Envoyer l'email
        await emailService.sendPasswordResetEmail(email, token, firstName);
        
        return token;
    },

    async verifyResetToken(token) {
        const result = await db.query(
            `SELECT prt.*, u.email, u.first_name
            FROM password_reset_tokens prt
            JOIN users u ON u.id = prt.user_id
            WHERE prt.token = $1 
            AND prt.used_at IS NULL 
            AND prt.expires_at > CURRENT_TIMESTAMP`,
            [token]
        );

        if (result.rows.length === 0) {
            throw new Error('Token invalide ou expiré');
        }

        return result.rows[0];
    },

    async resetPassword(token, newPassword) {
        const client = await db.pool.connect();
        
        try {
            await client.query('BEGIN');

            // Vérifier et récupérer le token valide
            const tokenData = await this.verifyResetToken(token);
            
            // Hasher le nouveau mot de passe
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Mettre à jour le mot de passe
            await client.query(
                'UPDATE users SET password_hash = $1 WHERE id = $2',
                [hashedPassword, tokenData.user_id]
            );

            // Marquer le token comme utilisé
            await client.query(
                'UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE token = $1',
                [token]
            );

            await client.query('COMMIT');
            return true;

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
};

module.exports = passwordService;