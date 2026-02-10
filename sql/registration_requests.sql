CREATE TABLE IF NOT EXISTS registration_requests
(
    id      SERIAL PRIMARY KEY,
    email   VARCHAR(255) NOT NULL UNIQUE,
    token   VARCHAR(255) NOT NULL UNIQUE,
    user_id INT UNSIGNED NOT NULL REFERENCES users (id),
    INDEX (token, email, user_id)
);