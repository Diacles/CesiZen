const db = require('../config/database');

const emotionController = {
    // Récupérer toutes les catégories et émotions
    getEmotionCategories: async (req, res) => {
        try {
            const result = await db.query(
                `SELECT ec.id, ec.name, ec.description, 
                 json_agg(json_build_object('id', e.id, 'name', e.name)) as emotions
                 FROM emotion_categories ec
                 LEFT JOIN emotions e ON e.category_id = ec.id
                 GROUP BY ec.id, ec.name
                 ORDER BY ec.name`
            );
            res.status(200).json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            throw error;
        }
    },

    // Récupérer les émotions de l'utilisateur
    getUserEmotions: async (req, res) => {
        try {
            const userId = req.user.id;
            const { startDate, endDate } = req.query;
            
            let query = `
                SELECT ue.id, ue.intensity, ue.note, ue.created_at, 
                       e.name as emotion_name, ec.name as category_name
                FROM user_emotions ue
                JOIN emotions e ON e.id = ue.emotion_id
                JOIN emotion_categories ec ON ec.id = e.category_id
                WHERE ue.user_id = $1
            `;
            
            const queryParams = [userId];
            
            if (startDate && endDate) {
                query += ` AND ue.created_at BETWEEN $2 AND $3`;
                queryParams.push(startDate, endDate);
            }
            
            query += ` ORDER BY ue.created_at DESC`;
            
            const result = await db.query(query, queryParams);
            
            res.status(200).json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            throw error;
        }
    },

    // Ajouter une émotion
    addEmotion: async (req, res) => {
        try {
            const userId = req.user.id;
            const { emotionId, intensity, note } = req.body;
            
            const result = await db.query(
                `INSERT INTO user_emotions (user_id, emotion_id, intensity, note)
                 VALUES ($1, $2, $3, $4)
                 RETURNING id, created_at`,
                [userId, emotionId, intensity, note]
            );
            
            res.status(201).json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            throw error;
        }
    },

    // Modifier une émotion
    updateEmotion: async (req, res) => {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const { intensity, note } = req.body;
            
            const result = await db.query(
                `UPDATE user_emotions
                 SET intensity = $3, note = $4
                 WHERE id = $1 AND user_id = $2
                 RETURNING id, created_at`,
                [id, userId, intensity, note]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Émotion non trouvée ou accès non autorisé"
                });
            }
            
            res.status(200).json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            throw error;
        }
    },

    // Supprimer une émotion
    deleteEmotion: async (req, res) => {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            
            const result = await db.query(
                `DELETE FROM user_emotions
                 WHERE id = $1 AND user_id = $2
                 RETURNING id`,
                [id, userId]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Émotion non trouvée ou accès non autorisé"
                });
            }
            
            res.status(200).json({
                success: true,
                message: "Émotion supprimée avec succès"
            });
        } catch (error) {
            throw error;
        }
    },

    // Stats pour le tableau de bord
    getEmotionStats: async (req, res) => {
        try {
            const userId = req.user.id;
            const { period } = req.query;
            
            // Déterminer l'intervalle de date basé sur la période
            let dateInterval;
            if (period === 'week') {
                dateInterval = 'INTERVAL \'7 days\'';
            } else if (period === 'month') {
                dateInterval = 'INTERVAL \'1 month\'';
            } else if (period === 'year') {
                dateInterval = 'INTERVAL \'1 year\'';
            } else {
                dateInterval = 'INTERVAL \'7 days\''; // Par défaut: semaine
            }
            
            // Statistiques par catégorie
            const categoryStats = await db.query(
                `SELECT ec.name, COUNT(*) as count
                 FROM user_emotions ue
                 JOIN emotions e ON e.id = ue.emotion_id
                 JOIN emotion_categories ec ON ec.id = e.category_id
                 WHERE ue.user_id = $1 AND ue.created_at > NOW() - ${dateInterval}
                 GROUP BY ec.name
                 ORDER BY count DESC`,
                [userId]
            );
            
            // Émotions les plus fréquentes
            const topEmotions = await db.query(
                `SELECT e.name, ec.name as category, COUNT(*) as count
                 FROM user_emotions ue
                 JOIN emotions e ON e.id = ue.emotion_id
                 JOIN emotion_categories ec ON ec.id = e.category_id
                 WHERE ue.user_id = $1 AND ue.created_at > NOW() - ${dateInterval}
                 GROUP BY e.name, ec.name
                 ORDER BY count DESC
                 LIMIT 10`,
                [userId]
            );
            
            // Données temporelles
            const timeData = await db.query(
                `SELECT 
                    DATE_TRUNC('day', ue.created_at) as date,
                    ec.name as category,
                    COUNT(*) as count
                 FROM user_emotions ue
                 JOIN emotions e ON e.id = ue.emotion_id
                 JOIN emotion_categories ec ON ec.id = e.category_id
                 WHERE ue.user_id = $1 AND ue.created_at > NOW() - ${dateInterval}
                 GROUP BY DATE_TRUNC('day', ue.created_at), ec.name
                 ORDER BY date ASC`,
                [userId]
            );
            
            res.status(200).json({
                success: true,
                data: {
                    categoryStats: categoryStats.rows,
                    topEmotions: topEmotions.rows,
                    timeData: timeData.rows
                }
            });
        } catch (error) {
            throw error;
        }
    }
};

module.exports = emotionController;