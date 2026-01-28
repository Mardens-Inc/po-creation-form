INSERT INTO seasons (name)
SELECT *
FROM (SELECT 'Spring' AS name
      UNION ALL SELECT 'Summer'
      UNION ALL SELECT 'Fall'
      UNION ALL SELECT 'Winter'
      UNION ALL SELECT 'Year Round') AS defaults
WHERE NOT EXISTS (SELECT 1 FROM seasons)