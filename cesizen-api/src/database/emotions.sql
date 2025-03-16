-- Insérer les catégories d'émotions
INSERT INTO emotion_categories (name) VALUES 
('Joie'),
('Colère'),
('Peur'),
('Tristesse'),
('Surprise'),
('Dégoût');

-- Insérer les émotions spécifiques
INSERT INTO emotions (name, category_id) VALUES 
-- Joie
('Fierté', (SELECT id FROM emotion_categories WHERE name = 'Joie')),
('Contentement', (SELECT id FROM emotion_categories WHERE name = 'Joie')),
('Enchantement', (SELECT id FROM emotion_categories WHERE name = 'Joie')),
('Excitation', (SELECT id FROM emotion_categories WHERE name = 'Joie')),
('Émerveillement', (SELECT id FROM emotion_categories WHERE name = 'Joie')),
('Gratitude', (SELECT id FROM emotion_categories WHERE name = 'Joie')),
-- Colère
('Frustration', (SELECT id FROM emotion_categories WHERE name = 'Colère')),
('Irritation', (SELECT id FROM emotion_categories WHERE name = 'Colère')),
('Rage', (SELECT id FROM emotion_categories WHERE name = 'Colère')),
('Ressentiment', (SELECT id FROM emotion_categories WHERE name = 'Colère')),
('Agacement', (SELECT id FROM emotion_categories WHERE name = 'Colère')),
('Hostilité', (SELECT id FROM emotion_categories WHERE name = 'Colère')),
-- Peur
('Inquiétude', (SELECT id FROM emotion_categories WHERE name = 'Peur')),
('Anxiété', (SELECT id FROM emotion_categories WHERE name = 'Peur')),
('Terreur', (SELECT id FROM emotion_categories WHERE name = 'Peur')),
('Appréhension', (SELECT id FROM emotion_categories WHERE name = 'Peur')),
('Panique', (SELECT id FROM emotion_categories WHERE name = 'Peur')),
('Crainte', (SELECT id FROM emotion_categories WHERE name = 'Peur')),
-- Tristesse
('Chagrin', (SELECT id FROM emotion_categories WHERE name = 'Tristesse')),
('Mélancolie', (SELECT id FROM emotion_categories WHERE name = 'Tristesse')),
('Abattement', (SELECT id FROM emotion_categories WHERE name = 'Tristesse')),
('Désespoir', (SELECT id FROM emotion_categories WHERE name = 'Tristesse')),
('Solitude', (SELECT id FROM emotion_categories WHERE name = 'Tristesse')),
('Dépression', (SELECT id FROM emotion_categories WHERE name = 'Tristesse')),
-- Surprise
('Étonnement', (SELECT id FROM emotion_categories WHERE name = 'Surprise')),
('Stupéfaction', (SELECT id FROM emotion_categories WHERE name = 'Surprise')),
('Sidération', (SELECT id FROM emotion_categories WHERE name = 'Surprise')),
('Incrédule', (SELECT id FROM emotion_categories WHERE name = 'Surprise')),
('Confusion', (SELECT id FROM emotion_categories WHERE name = 'Surprise')),
-- Dégoût
('Répulsion', (SELECT id FROM emotion_categories WHERE name = 'Dégoût')),
('Déplaisir', (SELECT id FROM emotion_categories WHERE name = 'Dégoût')),
('Nausée', (SELECT id FROM emotion_categories WHERE name = 'Dégoût')),
('Dédain', (SELECT id FROM emotion_categories WHERE name = 'Dégoût')),
('Horreur', (SELECT id FROM emotion_categories WHERE name = 'Dégoût')),
('Dégoût profond', (SELECT id FROM emotion_categories WHERE name = 'Dégoût'));