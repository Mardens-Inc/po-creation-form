CREATE TABLE IF NOT EXISTS categories
(
    id            INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    code          VARCHAR(10)  NOT NULL,
    department_id INT UNSIGNED NOT NULL,
    INDEX (department_id),
    FOREIGN KEY (department_id) REFERENCES departments (id)
)