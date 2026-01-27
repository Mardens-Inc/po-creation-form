CREATE TABLE IF NOT EXISTS item_data
(
    id   INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type TINYINT      NOT NULL, -- 0 = department, 1 = category, 2 = subcategory, 3 = season
    INDEX (type)
);

-- Insert defaults only if table is empty
-- General
-- Clothing
-- Furniture
-- Grocery Taxable
-- Shoes
-- Fabric
-- Flooring/Carpet
-- Hardware
-- Special Sales
-- Grocery Non-Taxable

INSERT INTO item_data (name, type)
SELECT *
FROM (SELECT 'General' AS name, 0 AS type
      UNION ALL
      SELECT 'Clothing', 0
      UNION ALL
      SELECT 'Furniture', 0
      UNION ALL
      SELECT 'Grocery Taxable', 0
      UNION ALL
      SELECT 'Shoes', 0
      UNION ALL
      SELECT 'Fabric', 0
      UNION ALL
      SELECT 'Flooring/Carpet', 0
      UNION ALL
      SELECT 'Hardware', 0
      UNION ALL
      SELECT 'Special Sales', 0
      UNION ALL
      SELECT 'Grocery Non-Taxable', 0) AS defaults
WHERE NOT EXISTS (SELECT 1 FROM item_data);