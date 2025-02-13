const db = require('../config/database');

const roleController = {
    // Assigner un rôle à un utilisateur
    assignRole: async (req, res) => {
        const client = await db.pool.connect();
        try {
            const { userId, roleName } = req.body;
            await client.query('BEGIN');

            // Vérifier si l'utilisateur existe
            const userExists = await client.query(
                'SELECT id FROM users WHERE id = $1',
                [userId]
            );

            if (userExists.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Utilisateur non trouvé"
                });
            }

            // Vérifier si le rôle existe
            const roleExists = await client.query(
                'SELECT id FROM roles WHERE name = $1',
                [roleName]
            );

            if (roleExists.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Rôle non trouvé"
                });
            }

            // Assigner le rôle
            await client.query(
                'SELECT assign_role($1, $2)',
                [userId, roleName]
            );

            await client.query('COMMIT');

            res.status(200).json({
                success: true,
                message: `Rôle ${roleName} assigné avec succès à l'utilisateur ${userId}`
            });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erreur lors de l\'attribution du rôle:', error);
            throw error;
        } finally {
            client.release();
        }
    },

    // Retirer un rôle à un utilisateur
    removeRole: async (req, res) => {
        const client = await db.pool.connect();
        try {
            const { userId, roleName } = req.body;
            await client.query('BEGIN');

            // Vérifier si la combinaison utilisateur/rôle existe
            const roleAssignment = await client.query(
                `SELECT ur.user_id 
                FROM user_roles ur 
                JOIN roles r ON r.id = ur.role_id 
                WHERE ur.user_id = $1 AND r.name = $2`,
                [userId, roleName]
            );

            if (roleAssignment.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Attribution de rôle non trouvée"
                });
            }

            // Empêcher la suppression du dernier rôle ADMIN
            if (roleName === 'ADMIN') {
                const adminCount = await client.query(
                    `SELECT COUNT(*) 
                    FROM user_roles ur 
                    JOIN roles r ON r.id = ur.role_id 
                    WHERE r.name = 'ADMIN'`
                );

                if (adminCount.rows[0].count <= 1) {
                    return res.status(400).json({
                        success: false,
                        message: "Impossible de supprimer le dernier administrateur"
                    });
                }
            }

            // Supprimer le rôle
            await client.query(
                `DELETE FROM user_roles ur 
                USING roles r 
                WHERE ur.role_id = r.id 
                AND ur.user_id = $1 
                AND r.name = $2`,
                [userId, roleName]
            );

            await client.query('COMMIT');

            res.status(200).json({
                success: true,
                message: `Rôle ${roleName} retiré avec succès de l'utilisateur ${userId}`
            });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erreur lors du retrait du rôle:', error);
            throw error;
        } finally {
            client.release();
        }
    },

    // Lister les rôles d'un utilisateur
    getUserRoles: async (req, res) => {
        try {
            const { userId } = req.params;

            const result = await db.query(
                `SELECT r.name, r.description
                FROM user_roles ur
                JOIN roles r ON r.id = ur.role_id
                WHERE ur.user_id = $1`,
                [userId]
            );

            res.status(200).json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des rôles:', error);
            throw error;
        }
    },

    // Lister tous les rôles disponibles
    getAllRoles: async (req, res) => {
        try {
            const result = await db.query(
                'SELECT name, description FROM roles ORDER BY name'
            );

            res.status(200).json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des rôles:', error);
            throw error;
        }
    }
};

module.exports = roleController;