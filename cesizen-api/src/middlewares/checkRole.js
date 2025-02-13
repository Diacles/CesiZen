const db = require('../config/database');

const checkRole = (roles) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            
            const result = await db.query(
                `SELECT r.name 
                FROM user_roles ur 
                JOIN roles r ON r.id = ur.role_id 
                WHERE ur.user_id = $1`,
                [userId]
            );
            
            const userRoles = result.rows.map(row => row.name);
            
            if (!roles.some(role => userRoles.includes(role))) {
                return res.status(403).json({
                    success: false,
                    message: "Accès non autorisé"
                });
            }
            
            req.userRoles = userRoles;
            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = checkRole;