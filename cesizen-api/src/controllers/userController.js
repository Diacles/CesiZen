const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passwordService = require('../services/passwordService');

// Gestionnaire des erreurs pour async/await
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

const userController = {
    // POST /api/users/register
    register: asyncHandler(async (req, res) => {
        const { email, password, firstName, lastName } = req.body;

        try {
            // Vérifier si l'utilisateur existe déjà
            const userExists = await db.query(
                'SELECT * FROM users WHERE email = $1',
                [email]
            );

            if (userExists.rows.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Un utilisateur avec cet email existe déjà"
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const result = await db.query(
                `INSERT INTO users (email, password_hash, first_name, last_name)
                VALUES ($1, $2, $3, $4)
                RETURNING id, email, first_name, last_name, created_at`,
                [email, hashedPassword, firstName, lastName]
            );

            res.status(201).json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Erreur lors de l\'inscription:', error);
            throw error;
        }
    }),

    // POST /api/users/login
    login: asyncHandler(async (req, res) => {
        const { email, password } = req.body;

        try {
            const result = await db.query(
                'SELECT * FROM users WHERE email = $1',
                [email]
            );

            const user = result.rows[0];

            if (!user || !(await bcrypt.compare(password, user.password_hash))) {
                return res.status(401).json({
                    success: false,
                    message: "Email ou mot de passe incorrect"
                });
            }

            res.status(200).json({
                success: true,
                message: "Connexion réussie",
                token: jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' })
            });
        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            throw error;
        }
    }),

    // GET /api/users/profile
    getProfile: asyncHandler(async (req, res) => {
        try {
            // En production, nous récupérerons l'ID depuis le token JWT
            const userId = req.user.id;

            const result = await db.query(
                `SELECT id, email, first_name, last_name, created_at, updated_at
                FROM users WHERE id = $1`,
                [userId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Utilisateur non trouvé"
                });
            }

            res.status(200).json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Erreur lors de la récupération du profil:', error);
            throw error;
        }
    }),

    // PUT /api/users/profile
    updateProfile: asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const { first_name, last_name, email } = req.body; // Changé ici pour correspondre au frontend
    
            const result = await db.query(
                `UPDATE users
                SET first_name = COALESCE($1, first_name),
                    last_name = COALESCE($2, last_name),
                    email = COALESCE($3, email),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $4
                RETURNING id, email, first_name, last_name, updated_at`,
                [first_name, last_name, email, userId] // Changé ici aussi
            );
    
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Utilisateur non trouvé"
                });
            }
    
            res.status(200).json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour du profil:', error);
            throw error;
        }
    }),

    forgotPassword: asyncHandler(async (req, res) => {
        const { email } = req.body;
    
        try {
            console.log('SMTP Password:', process.env.SMTP_PASSWORD);
            // Vérifier si l'utilisateur existe
            const result = await db.query(
                'SELECT id, email, first_name FROM users WHERE email = $1',
                [email]
            );
    
            if (result.rows.length === 0) {
                return res.status(200).json({
                    success: true,
                    message: "Si un compte existe avec cet email, vous recevrez les instructions de réinitialisation."
                });
            }
    
            const user = result.rows[0];
            
            try {
                await passwordService.createResetToken(user.id, user.email, user.first_name);
                
                res.status(200).json({
                    success: true,
                    message: "Si un compte existe avec cet email, vous recevrez les instructions de réinitialisation."
                });
            } catch (emailError) {
                // Log de l'erreur d'email
                console.error('Erreur lors de l\'envoi de l\'email:', emailError);
                
                res.status(500).json({
                    success: false,
                    message: "Erreur lors de l'envoi de l'email de réinitialisation",
                    error: process.env.NODE_ENV === 'development' ? emailError.message : undefined
                });
            }
        } catch (error) {
            console.error('Erreur lors de la demande de réinitialisation:', error);
            throw error;
        }
    }),

    // POST /api/users/reset-password
    resetPassword: asyncHandler(async (req, res) => {
        const { token, newPassword } = req.body;

        try {
            await passwordService.resetPassword(token, newPassword);

            res.status(200).json({
                success: true,
                message: "Votre mot de passe a été réinitialisé avec succès"
            });
        } catch (error) {
            if (error.message === 'Token invalide ou expiré') {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            throw error;
        }
    })

};

module.exports = userController;