CREATE TABLE IF NOT EXISTS subcategories
(
    id          INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    code        VARCHAR(10)  NOT NULL,
    category_id INT UNSIGNED NOT NULL,
    INDEX (category_id),
    FOREIGN KEY (category_id) REFERENCES categories (id)
)