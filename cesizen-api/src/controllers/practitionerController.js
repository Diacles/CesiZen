const db = require('../config/database');

const practitionerController = {
    // Récupérer la liste des patients du praticien
    getPatients: async (req, res) => {
        try {
            const practitionerId = req.user.id;
            const result = await db.query(
                `SELECT u.id, u.first_name, u.last_name, u.email,
                        u.created_at as patient_since
                FROM users u
                JOIN practitioner_patients pp ON pp.patient_id = u.id
                WHERE pp.practitioner_id = $1
                ORDER BY u.last_name, u.first_name`,
                [practitionerId]
            );

            res.status(200).json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            throw error;
        }
    },

    // Ajouter un patient à son suivi
    addPatient: async (req, res) => {
        const client = await db.pool.connect();
        try {
            const practitionerId = req.user.id;
            const { patientId } = req.body;

            await client.query('BEGIN');

            // Vérifier si le patient existe et n'est pas déjà suivi
            const exists = await client.query(
                `SELECT 1 FROM practitioner_patients 
                WHERE practitioner_id = $1 AND patient_id = $2`,
                [practitionerId, patientId]
            );

            if (exists.rows.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Ce patient est déjà dans votre suivi"
                });
            }

            await client.query(
                `INSERT INTO practitioner_patients (practitioner_id, patient_id)
                VALUES ($1, $2)`,
                [practitionerId, patientId]
            );

            await client.query('COMMIT');

            res.status(201).json({
                success: true,
                message: "Patient ajouté au suivi"
            });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    // Ajouter une note de suivi
    addFollowUpNote: async (req, res) => {
        const client = await db.pool.connect();
        try {
            const practitionerId = req.user.id;
            const { patientId, content, category } = req.body;

            await client.query('BEGIN');

            // Vérifier l'accès au patient
            const hasAccess = await client.query(
                `SELECT 1 FROM practitioner_patients 
                WHERE practitioner_id = $1 AND patient_id = $2`,
                [practitionerId, patientId]
            );

            if (hasAccess.rows.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: "Accès non autorisé à ce patient"
                });
            }

            const result = await client.query(
                `INSERT INTO follow_up_notes 
                (practitioner_id, patient_id, content, category)
                VALUES ($1, $2, $3, $4)
                RETURNING id, created_at`,
                [practitionerId, patientId, content, category]
            );

            await client.query('COMMIT');

            res.status(201).json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    // Consulter l'historique des notes d'un patient
    getPatientNotes: async (req, res) => {
        try {
            const practitionerId = req.user.id;
            const { patientId } = req.params;

            const result = await db.query(
                `SELECT fn.id, fn.content, fn.category, 
                        fn.created_at, fn.updated_at
                FROM follow_up_notes fn
                JOIN practitioner_patients pp 
                    ON pp.patient_id = fn.patient_id 
                    AND pp.practitioner_id = fn.practitioner_id
                WHERE fn.practitioner_id = $1 
                    AND fn.patient_id = $2
                ORDER BY fn.created_at DESC`,
                [practitionerId, patientId]
            );

            res.status(200).json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            throw error;
        }
    }
};

module.exports = practitionerController;