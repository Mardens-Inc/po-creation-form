CREATE TABLE IF NOT EXISTS vendor_ship_locations (
    id        INT UNSIGNED UNIQUE AUTO_INCREMENT NOT NULL,
    vendor_id INT UNSIGNED NOT NULL,
    address   VARCHAR(500) NOT NULL,
    PRIMARY KEY (id),
    INDEX (vendor_id),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
)
