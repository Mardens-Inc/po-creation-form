CREATE TABLE IF NOT EXISTS vendor_contacts (
    id         INT UNSIGNED UNIQUE AUTO_INCREMENT NOT NULL,
    vendor_id  INT UNSIGNED NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name  VARCHAR(255) NOT NULL,
    email      VARCHAR(255) NOT NULL,
    phone      VARCHAR(50)  DEFAULT '' NOT NULL,
    PRIMARY KEY (id),
    INDEX (vendor_id),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
)
