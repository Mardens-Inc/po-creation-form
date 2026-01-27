INSERT INTO subcategories (name, code, category_id)
SELECT s.name, s.code, c.id
FROM (
    SELECT 'Underwear'              AS name, 'UNDER' AS code, 'GIRLS' AS cat_code UNION ALL
    SELECT 'Outerwear',                      'OUTER',         'GIRLS' UNION ALL
    SELECT 'Hats, Mittens, & Gloves',        'HMG',           'GIRLS' UNION ALL
    SELECT 'Socks',                          'SOCKS',         'GIRLS' UNION ALL
    SELECT 'Underwear',                      'UNDER',         'MENS' UNION ALL
    SELECT 'Outerwear',                      'OUTER',         'MENS' UNION ALL
    SELECT 'Hats, Mittens, & Gloves',        'HMG',           'MENS' UNION ALL
    SELECT 'Socks',                          'SOCKS',         'MENS' UNION ALL
    SELECT 'Underwear',                      'UNDER',         'WOMEN' UNION ALL
    SELECT 'Outerwear',                      'OUTER',         'WOMEN' UNION ALL
    SELECT 'Hats, Mittens, & Gloves',        'HMG',           'WOMEN' UNION ALL
    SELECT 'Socks',                          'SOCKS',         'WOMEN' UNION ALL
    SELECT 'Underwear',                      'UNDER',         'BABY' UNION ALL
    SELECT 'Outerwear',                      'OUTER',         'BABY' UNION ALL
    SELECT 'Hats, Mittens, & Gloves',        'HMG',           'BABY' UNION ALL
    SELECT 'Bras',                           'BRA',           'BABY' UNION ALL
    SELECT 'Socks',                          'SOCKS',         'TOWEL' UNION ALL
    SELECT 'Outerwear',                      'OUTER',         'TOWEL' UNION ALL
    SELECT 'Hats, Mittens, & Gloves',        'HMG',           'TOWEL' UNION ALL
    SELECT 'Beach',                          'BEACH',         'CURT' UNION ALL
    SELECT 'Bath',                           'BATH',          'CURT' UNION ALL
    SELECT 'Hand',                           'HAND',          'CURT' UNION ALL
    SELECT 'Washcloths',                     'WASH',          'CURT' UNION ALL
    SELECT 'Dish Towels',                    'DISH',          'CURT' UNION ALL
    SELECT 'Cotton',                         'COTTN',         'UTIL' UNION ALL
    SELECT 'Fashion',                        'FASHN',         'UTIL' UNION ALL
    SELECT 'Home Décor',                     'DÉCOR',         'UTIL' UNION ALL
    SELECT 'Fleece',                         'FLEECE',        'UTIL' UNION ALL
    SELECT 'Foam',                           'FOAM',          'NOT' UNION ALL
    SELECT 'Batting',                        'BATNG',         'NOT' UNION ALL
    SELECT 'Implements',                     'IMPLE',         'FOOD' UNION ALL
    SELECT 'Grocery',                        'GROC',          'HBC' UNION ALL
    SELECT 'Snack',                          'SNACK',         'HBC' UNION ALL
    SELECT 'Candy',                          'CANDY',         'HBC' UNION ALL
    SELECT 'Canned Goods',                   'CAN',           'HBC' UNION ALL
    SELECT 'Jarred Goods',                   'JARS',          'HBC' UNION ALL
    SELECT 'Tents/Shelters',                 'TENT',          'CAND' UNION ALL
    SELECT 'Sleeping Bags',                  'SLEEP',         'CAND' UNION ALL
    SELECT 'Tags',                           'TAGS',          'CARDS' UNION ALL
    SELECT 'Gift Boxes',                     'BOX',           'CARDS' UNION ALL
    SELECT 'Tissue Paper',                   'TISS',          'CARDS' UNION ALL
    SELECT 'Gift Bags',                      'BAGS',          'CARDS' UNION ALL
    SELECT 'Bows',                           'BOWS',          'CARDS' UNION ALL
    SELECT 'Ornaments',                      'ORN',           'LAWN' UNION ALL
    SELECT 'Flags',                          'FLAGS',         'LAWN' UNION ALL
    SELECT 'Suitcase',                       'SCSE',          'LUGG' UNION ALL
    SELECT 'Bookbags',                       'BKBG',          'LUGG' UNION ALL
    SELECT 'Puzzles',                        'PUZZ',          'TOYS' UNION ALL
    SELECT 'Indoor',                         'INDR',          'TOYS' UNION ALL
    SELECT 'Bulk Toys',                      'BULK',          'TOYS' UNION ALL
    SELECT 'Pool Toys',                      'POOL',          'OUTDR' UNION ALL
    SELECT 'Solar',                          'SOLAR',         'OUTDR' UNION ALL
    SELECT 'Décor',                          'LAWN',          'OUTDR' UNION ALL
    SELECT 'Clock',                          'CLOCK',         'WALL' UNION ALL
    SELECT 'Mirror',                         'MIRR',          'WALL' UNION ALL
    SELECT 'Art',                            'WLART',         'WALL' UNION ALL
    SELECT 'Brush/Scraper',                  'WINTR',         'AUTO' UNION ALL
    SELECT 'Detailing',                      'DTAIL',         'AUTO' UNION ALL
    SELECT 'Floor Mats',                     'MATS',          'AUTO' UNION ALL
    SELECT 'Fluids',                         'FLUID',         'AUTO' UNION ALL
    SELECT 'Lubricants',                     'LUBE',          'AUTO' UNION ALL
    SELECT 'Jumper Cables',                  'CABLE',         'AUTO' UNION ALL
    SELECT 'Sprinklers, Nozzles',            'WATER',         'GARD' UNION ALL
    SELECT 'Fencing',                        'FENCE',         'GARD' UNION ALL
    SELECT 'Hose',                           'HOSE',          'GARD' UNION ALL
    SELECT 'Hand Tools',                     'GTOOL',         'GARD' UNION ALL
    SELECT 'Chain',                          'CHAIN',         'TARPS' UNION ALL
    SELECT 'Cable',                          'CABLE',         'TARPS' UNION ALL
    SELECT 'Heavy Duty',                     'HEAVY',         'PAINT' UNION ALL
    SELECT 'Standard',                       'STAND',         'PAINT' UNION ALL
    SELECT 'Extra Heavy Duty',               'XHD',           'PAINT' UNION ALL
    SELECT 'Brushes',                        'BRUSH',         'ROPE' UNION ALL
    SELECT 'Stain',                          'STAIN',         'ROPE' UNION ALL
    SELECT 'Spray Paint',                    'SPRAY',         'ROPE' UNION ALL
    SELECT 'Paint',                          'PAINT',         'ROPE' UNION ALL
    SELECT 'Roller Covers',                  'ROLLR',         'ROPE' UNION ALL
    SELECT 'Tray Kits',                      'KITS',          'ROPE' UNION ALL
    SELECT 'Drop Cloths',                    'DROP',          'ROPE' UNION ALL
    SELECT 'Shovels',                        'SHVLS',         'SNOW' UNION ALL
    SELECT 'Salt/Ice Melt',                  'MELT',          'SNOW' UNION ALL
    SELECT 'Duct Tape',                      'DUCT',          'TAPE' UNION ALL
    SELECT 'Electrical Tape',                'ELECT',         'TAPE' UNION ALL
    SELECT 'Masking Tape',                   'MASK',          'TAPE' UNION ALL
    SELECT 'Painter''s Tape',                'PAINT',         'TAPE' UNION ALL
    SELECT 'Packing Tape',                   'PACK',          'TAPE' UNION ALL
    SELECT 'Sandals',                        'SNDAL',         'SMENS' UNION ALL
    SELECT 'Boots',                          'BOOTS',         'SMENS' UNION ALL
    SELECT 'Slippers',                       'SLIP',          'SMENS' UNION ALL
    SELECT 'Sandals',                        'SNDAL',         'SWMNS' UNION ALL
    SELECT 'Boots',                          'BOOTS',         'SWMNS' UNION ALL
    SELECT 'Slippers',                       'SLIP',          'SWMNS' UNION ALL
    SELECT 'Sandals',                        'SNDAL',         'SKIDS' UNION ALL
    SELECT 'Boots',                          'BOOTS',         'SKIDS' UNION ALL
    SELECT 'Slippers',                       'SLIP',          'SKIDS'
) AS s
JOIN categories c ON c.code = s.cat_code
WHERE NOT EXISTS (SELECT 1 FROM subcategories)