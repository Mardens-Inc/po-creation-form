CREATE TABLE IF NOT EXISTS users
(
    id                   INT UNSIGNED UNIQUE AUTO_INCREMENT         NOT NULL,
    first_name           VARCHAR(255)                               NOT NULL,
    last_name            VARCHAR(255)                               NOT NULL,
    email                VARCHAR(255) UNIQUE                        NOT NULL,
    password             VARCHAR(255)                               NOT NULL,
    role                 TINYINT UNSIGNED DEFAULT 2                 NOT NULL,
    needs_password_reset BOOLEAN          DEFAULT FALSE,
    has_confirmed_email  BOOLEAN          DEFAULT FALSE,
    mfa_secret           VARCHAR(255)     DEFAULT NULL,
    mfa_enabled          BOOLEAN          DEFAULT FALSE,
    has_validated_mfa    BOOLEAN          DEFAULT FALSE,
    last_ip              VARCHAR(255)     DEFAULT NULL,
    created_at           TIMESTAMP        DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_online          TIMESTAMP        DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (id),
    INDEX (email)
)