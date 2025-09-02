CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE user_roles (
    user_id INTEGER REFERENCES users(id),
    role_id INTEGER REFERENCES roles(id),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE emotion_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE emotions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    category_id INTEGER REFERENCES emotion_categories(id) ON DELETE CASCADE
);

CREATE TABLE user_emotions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    emotion_id INTEGER REFERENCES emotions(id) ON DELETE CASCADE,
    intensity INTEGER CHECK (intensity BETWEEN 1 AND 5),
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour accélérer la recherche des tokens (après création de la table)
CREATE INDEX idx_valid_tokens ON password_reset_tokens (token, expires_at);

-- Association praticien-patient
CREATE TABLE practitioner_patients (
    practitioner_id INTEGER REFERENCES users(id),
    patient_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (practitioner_id, patient_id)
);

-- Notes de suivi
CREATE TABLE follow_up_notes (
    id SERIAL PRIMARY KEY,
    practitioner_id INTEGER REFERENCES users(id),
    patient_id INTEGER REFERENCES users(id),
    content TEXT NOT NULL,
    category VARCHAR(50) CHECK (category IN ('CONSULTATION', 'SUIVI', 'PRESCRIPTION', 'AUTRE')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimiser les recherches
CREATE INDEX idx_practitioner_patients ON practitioner_patients(practitioner_id);
CREATE INDEX idx_follow_up_notes_patient ON follow_up_notes(patient_id);
CREATE INDEX idx_follow_up_notes_practitioner ON follow_up_notes(practitioner_id);