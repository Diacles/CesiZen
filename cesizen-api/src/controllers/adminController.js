const db = require('../config/database');

const adminController = {
    getAllUsers: async (req, res) => {
        try {
            const result = await db.query(
                `SELECT u.id, u.email, u.first_name, u.last_name, 
                        u.created_at, array_agg(r.name) as roles
                FROM users u
                LEFT JOIN user_roles ur ON u.id = ur.user_id
                LEFT JOIN roles r ON ur.role_id = r.id
                GROUP BY u.id
                ORDER BY u.created_at DESC`
            );

            res.status(200).json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error);
            throw error;
        }
    }
};

module.exports = adminController;