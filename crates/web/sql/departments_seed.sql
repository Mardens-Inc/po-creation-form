INSERT INTO departments (name, code)
SELECT *
FROM (SELECT 'Clothing' AS name, 'CLO' AS code
      UNION ALL SELECT 'Domestics', 'DOM'
      UNION ALL SELECT 'Fabric', 'FAB'
      UNION ALL SELECT 'Consumables', 'CON'
      UNION ALL SELECT 'General', 'GEN'
      UNION ALL SELECT 'Housewares', 'HSW'
      UNION ALL SELECT 'Pets', 'PETS'
      UNION ALL SELECT 'Sporting Goods', 'SPO'
      UNION ALL SELECT 'Hardware', 'HDW'
      UNION ALL SELECT 'Shoes', 'SHO'
      UNION ALL SELECT 'Store Use', 'STR') AS defaults
WHERE NOT EXISTS (SELECT 1 FROM departments)