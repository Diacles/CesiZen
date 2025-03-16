const db = require('../config/database');

// Gestionnaire des erreurs pour async/await
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

const articleController = {
    // GET /api/articles - Récupérer tous les articles publiés
    getAllArticles: asyncHandler(async (req, res) => {
        try {
            const { category, search, limit = 10, offset = 0 } = req.query;
            
            let query = `
                SELECT a.id, a.title, a.slug, a.summary, a.image_url, 
                       a.published_at, u.first_name, u.last_name,
                       array_agg(DISTINCT ac.name) as categories
                FROM articles a
                LEFT JOIN users u ON a.author_id = u.id
                LEFT JOIN article_category_relations acr ON a.id = acr.article_id
                LEFT JOIN article_categories ac ON acr.category_id = ac.id
                WHERE a.published = true
            `;
            
            const queryParams = [];
            let paramCount = 1;
            
            // Filtrer par catégorie
            if (category) {
                query += ` AND EXISTS (
                    SELECT 1 FROM article_category_relations acr2
                    JOIN article_categories ac2 ON acr2.category_id = ac2.id
                    WHERE acr2.article_id = a.id AND ac2.name = $${paramCount}
                )`;
                queryParams.push(category);
                paramCount++;
            }
            
            // Recherche dans le titre ou contenu
            if (search) {
                query += ` AND (
                    a.title ILIKE $${paramCount} 
                    OR a.content ILIKE $${paramCount}
                    OR a.summary ILIKE $${paramCount}
                )`;
                queryParams.push(`%${search}%`);
                paramCount++;
            }
            
            // Grouper par article
            query += `
                GROUP BY a.id, u.first_name, u.last_name
                ORDER BY a.published_at DESC
                LIMIT $${paramCount} OFFSET $${paramCount + 1}
            `;
            queryParams.push(limit, offset);
            
            const result = await db.query(query, queryParams);
            
            // Compter le nombre total d'articles pour la pagination
            const countQuery = `
                SELECT COUNT(DISTINCT a.id) as total
                FROM articles a
                LEFT JOIN article_category_relations acr ON a.id = acr.article_id
                LEFT JOIN article_categories ac ON acr.category_id = ac.id
                WHERE a.published = true
            `;
            
            const countParams = [];
            let countParamIndex = 1;
            
            // Appliquer les mêmes filtres pour le comptage
            if (category) {
                countQuery += ` AND EXISTS (
                    SELECT 1 FROM article_category_relations acr2
                    JOIN article_categories ac2 ON acr2.category_id = ac2.id
                    WHERE acr2.article_id = a.id AND ac2.name = $${countParamIndex}
                )`;
                countParams.push(category);
                countParamIndex++;
            }
            
            if (search) {
                countQuery += ` AND (
                    a.title ILIKE $${countParamIndex} 
                    OR a.content ILIKE $${countParamIndex}
                    OR a.summary ILIKE $${countParamIndex}
                )`;
                countParams.push(`%${search}%`);
            }
            
            const countResult = await db.query(countQuery, countParams);
            const total = parseInt(countResult.rows[0].total);
            
            res.status(200).json({
                success: true,
                data: result.rows,
                pagination: {
                    total,
                    pages: Math.ceil(total / limit),
                    currentPage: Math.floor(offset / limit) + 1,
                    limit: parseInt(limit)
                }
            });
        } catch (error) {
            throw error;
        }
    }),

    // GET /api/articles/:slug - Récupérer un article par son slug
    getArticleBySlug: asyncHandler(async (req, res) => {
        try {
            const { slug } = req.params;
            
            const query = `
                SELECT a.id, a.title, a.slug, a.summary, a.content, a.image_url, 
                       a.published_at, a.created_at, a.updated_at,
                       u.first_name, u.last_name,
                       array_agg(DISTINCT ac.name) as categories
                FROM articles a
                LEFT JOIN users u ON a.author_id = u.id
                LEFT JOIN article_category_relations acr ON a.id = acr.article_id
                LEFT JOIN article_categories ac ON acr.category_id = ac.id
                WHERE a.slug = $1 AND a.published = true
                GROUP BY a.id, u.first_name, u.last_name
            `;
            
            const result = await db.query(query, [slug]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Article non trouvé"
                });
            }
            
            res.status(200).json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            throw error;
        }
    }),

    // GET /api/articles/categories - Récupérer toutes les catégories
    getCategories: asyncHandler(async (req, res) => {
        try {
            const query = `
                SELECT id, name, description, created_at
                FROM article_categories
                ORDER BY name
            `;
            
            const result = await db.query(query);
            
            res.status(200).json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            throw error;
        }
    }),

    // === Routes administrateur ===

    // GET /api/articles/admin - Récupérer tous les articles (admin)
    getAdminArticles: asyncHandler(async (req, res) => {
        try {
            const { published, limit = 20, offset = 0 } = req.query;
            
            let query = `
                SELECT a.id, a.title, a.slug, a.summary, a.published,
                       a.created_at, a.published_at, a.updated_at,
                       u.first_name, u.last_name,
                       array_agg(DISTINCT ac.name) as categories
                FROM articles a
                LEFT JOIN users u ON a.author_id = u.id
                LEFT JOIN article_category_relations acr ON a.id = acr.article_id
                LEFT JOIN article_categories ac ON acr.category_id = ac.id
            `;
            
            const queryParams = [];
            let paramCount = 1;
            
            // Filtrer par statut de publication
            if (published !== undefined) {
                query += ` WHERE a.published = $${paramCount}`;
                queryParams.push(published === 'true');
                paramCount++;
            }
            
            // Grouper et ordonner
            query += `
                GROUP BY a.id, u.first_name, u.last_name
                ORDER BY a.created_at DESC
                LIMIT $${paramCount} OFFSET $${paramCount + 1}
            `;
            queryParams.push(limit, offset);
            
            const result = await db.query(query, queryParams);
            
            // Compter le nombre total d'articles
            let countQuery = `SELECT COUNT(*) as total FROM articles`;
            
            if (published !== undefined) {
                countQuery += ` WHERE published = $1`;
            }
            
            const countResult = await db.query(
                countQuery, 
                published !== undefined ? [published === 'true'] : []
            );
            
            const total = parseInt(countResult.rows[0].total);
            
            res.status(200).json({
                success: true,
                data: result.rows,
                pagination: {
                    total,
                    pages: Math.ceil(total / limit),
                    currentPage: Math.floor(offset / limit) + 1,
                    limit: parseInt(limit)
                }
            });
        } catch (error) {
            throw error;
        }
    }),

    // GET /api/articles/admin/:id - Récupérer un article par son ID (admin)
    getArticleById: asyncHandler(async (req, res) => {
        try {
            const { id } = req.params;
            
            const query = `
                SELECT a.id, a.title, a.slug, a.summary, a.content, a.image_url,
                       a.published, a.created_at, a.updated_at, a.published_at,
                       a.author_id, u.first_name, u.last_name,
                       array_agg(DISTINCT ac.id) as category_ids,
                       array_agg(DISTINCT ac.name) as categories
                FROM articles a
                LEFT JOIN users u ON a.author_id = u.id
                LEFT JOIN article_category_relations acr ON a.id = acr.article_id
                LEFT JOIN article_categories ac ON acr.category_id = ac.id
                WHERE a.id = $1
                GROUP BY a.id, u.first_name, u.last_name
            `;
            
            const result = await db.query(query, [id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Article non trouvé"
                });
            }
            
            res.status(200).json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            throw error;
        }
    }),

    // POST /api/articles - Créer un nouvel article (admin)
    createArticle: asyncHandler(async (req, res) => {
        const client = await db.pool.connect();
        
        try {
            await client.query('BEGIN');
            
            const { title, summary, content, imageUrl, published, categoryIds } = req.body;
            const authorId = req.user.id;
            
            // Générer le slug à partir du titre
            const slugResult = await client.query(
                'SELECT generate_slug($1) as slug',
                [title]
            );
            const slug = slugResult.rows[0].slug;
            
            // Vérifier si le slug existe déjà
            const slugCheckResult = await client.query(
                'SELECT 1 FROM articles WHERE slug = $1',
                [slug]
            );
            
            // Si le slug existe, ajouter un suffixe numérique
            let finalSlug = slug;
            if (slugCheckResult.rows.length > 0) {
                const slugCountResult = await client.query(
                    `SELECT COUNT(*) FROM articles WHERE slug LIKE $1`,
                    [`${slug}%`]
                );
                const count = parseInt(slugCountResult.rows[0].count) + 1;
                finalSlug = `${slug}-${count}`;
            }
            
            // Définir la date de publication si l'article est publié
            const publishedAt = published ? 'CURRENT_TIMESTAMP' : null;
            
            // Insérer l'article
            const result = await client.query(
                `INSERT INTO articles 
                (title, slug, summary, content, image_url, author_id, published, published_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, ${publishedAt})
                RETURNING id, title, slug, created_at`,
                [title, finalSlug, summary, content, imageUrl, authorId, published]
            );
            
            const articleId = result.rows[0].id;
            
            // Associer les catégories si fournies
            if (categoryIds && categoryIds.length > 0) {
                for (const categoryId of categoryIds) {
                    await client.query(
                        `INSERT INTO article_category_relations (article_id, category_id)
                        VALUES ($1, $2)`,
                        [articleId, categoryId]
                    );
                }
            }
            
            await client.query('COMMIT');
            
            res.status(201).json({
                success: true,
                data: result.rows[0],
                message: "Article créé avec succès"
            });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }),

    // PUT /api/articles/:id - Mettre à jour un article (admin)
    updateArticle: asyncHandler(async (req, res) => {
        const client = await db.pool.connect();
        
        try {
            await client.query('BEGIN');
            
            const { id } = req.params;
            const { title, summary, content, imageUrl, published, categoryIds } = req.body;
            
            // Vérifier que l'article existe
            const checkResult = await client.query(
                'SELECT author_id, published FROM articles WHERE id = $1',
                [id]
            );
            
            if (checkResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Article non trouvé"
                });
            }
            
            // Vérifier si l'utilisateur est l'auteur ou un admin
            const article = checkResult.rows[0];
            const userId = req.user.id;
            const isAuthor = article.author_id === userId;
            const isAdmin = req.userRoles && req.userRoles.includes('ADMIN');
            
            if (!isAdmin && !isAuthor) {
                return res.status(403).json({
                    success: false,
                    message: "Accès non autorisé"
                });
            }
            
            // Si l'article n'était pas publié mais l'est maintenant, mettre à jour la date de publication
            let publishedAt = null;
            if (!article.published && published) {
                publishedAt = 'CURRENT_TIMESTAMP';
            }
            
            // Mettre à jour l'article
            const updateQuery = `
                UPDATE articles
                SET title = $1,
                    summary = $2,
                    content = $3,
                    image_url = $4,
                    published = $5
                    ${publishedAt ? ', published_at = ' + publishedAt : ''}
                WHERE id = $6
                RETURNING id, title, slug, updated_at
            `;
            
            const result = await client.query(
                updateQuery,
                [title, summary, content, imageUrl, published, id]
            );
            
            // Mettre à jour les catégories si fournies
            if (categoryIds) {
                // Supprimer les associations existantes
                await client.query(
                    'DELETE FROM article_category_relations WHERE article_id = $1',
                    [id]
                );
                
                // Ajouter les nouvelles associations
                if (categoryIds.length > 0) {
                    for (const categoryId of categoryIds) {
                        await client.query(
                            `INSERT INTO article_category_relations (article_id, category_id)
                            VALUES ($1, $2)`,
                            [id, categoryId]
                        );
                    }
                }
            }
            
            await client.query('COMMIT');
            
            res.status(200).json({
                success: true,
                data: result.rows[0],
                message: "Article mis à jour avec succès"
            });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }),

    // DELETE /api/articles/:id - Supprimer un article (admin)
    deleteArticle: asyncHandler(async (req, res) => {
        try {
            const { id } = req.params;
            
            // Vérifier que l'article existe
            const checkResult = await db.query(
                'SELECT author_id FROM articles WHERE id = $1',
                [id]
            );
            
            if (checkResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Article non trouvé"
                });
            }
            
            // Vérifier si l'utilisateur est l'auteur ou un admin
            const article = checkResult.rows[0];
            const userId = req.user.id;
            const isAuthor = article.author_id === userId;
            const isAdmin = req.userRoles && req.userRoles.includes('ADMIN');
            
            if (!isAdmin && !isAuthor) {
                return res.status(403).json({
                    success: false,
                    message: "Accès non autorisé"
                });
            }
            
            // Supprimer l'article
            const result = await db.query(
                'DELETE FROM articles WHERE id = $1 RETURNING id',
                [id]
            );
            
            res.status(200).json({
                success: true,
                message: "Article supprimé avec succès"
            });
        } catch (error) {
            throw error;
        }
    }),
};

module.exports = articleController;