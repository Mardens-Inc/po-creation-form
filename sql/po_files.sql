CREATE TABLE IF NOT EXISTS po_files (
    id          INT UNSIGNED UNIQUE AUTO_INCREMENT NOT NULL,
    po_id       INT UNSIGNED NOT NULL,
    filename    VARCHAR(255) NOT NULL,
    asset_type  TINYINT UNSIGNED DEFAULT 0 NOT NULL,
    disk_path   VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    uploaded_by INT UNSIGNED NOT NULL,
    PRIMARY KEY (id),
    INDEX (po_id),
    FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
)
