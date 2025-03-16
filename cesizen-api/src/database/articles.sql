-- Table des articles
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    summary TEXT,
    content TEXT NOT NULL,
    image_url VARCHAR(255),
    author_id INTEGER REFERENCES users(id),
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP
);

-- Table des catégories d'articles
CREATE TABLE article_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table de relation entre articles et catégories
CREATE TABLE article_category_relations (
    article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES article_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, category_id)
);

-- Index pour améliorer les performances
CREATE INDEX idx_articles_published ON articles(published, published_at) WHERE published = true;
CREATE INDEX idx_articles_author ON articles(author_id);

-- Fonction pour mettre à jour le timestamp quand un article est modifié
CREATE OR REPLACE FUNCTION update_article_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour le timestamp automatiquement
CREATE TRIGGER update_article_timestamp
BEFORE UPDATE ON articles
FOR EACH ROW
EXECUTE FUNCTION update_article_timestamp();

-- Fonction pour générer un slug à partir d'un titre
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
DECLARE
    slug TEXT;
BEGIN
    -- Convertir en minuscules
    slug := lower(title);
    -- Remplacer les espaces par des tirets
    slug := regexp_replace(slug, '[[:space:]]+', '-', 'g');
    -- Supprimer les caractères spéciaux
    slug := regexp_replace(slug, '[^a-z0-9\-]', '', 'g');
    -- Supprimer les tirets multiples
    slug := regexp_replace(slug, '-+', '-', 'g');
    -- Supprimer les tirets au début et à la fin
    slug := trim(both '-' from slug);
    
    RETURN slug;
END;
$$ LANGUAGE plpgsql;

-- Insérer quelques catégories d'articles par défaut
INSERT INTO article_categories (name, description) VALUES 
('Santé mentale', 'Articles sur la santé mentale en général'),
('Gestion du stress', 'Techniques et conseils pour gérer le stress'),
('Bien-être', 'Articles sur le bien-être général'),
('Méditation', 'Guides et conseils sur la méditation'),
('Actualités', 'Actualités liées à la santé mentale');