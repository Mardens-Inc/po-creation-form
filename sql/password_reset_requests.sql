CREATE TABLE IF NOT EXISTS password_reset_requests
(
    id      SERIAL PRIMARY KEY,
    email   VARCHAR(255) NOT NULL,
    token   VARCHAR(255) NOT NULL UNIQUE,
    user_id INT UNSIGNED NOT NULL REFERENCES users (id),
    INDEX (token, email)
);
