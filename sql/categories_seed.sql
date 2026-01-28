INSERT INTO categories (name, code, department_id)
SELECT c.name, c.code, d.id
FROM (
    SELECT 'Boys'    AS name, 'BOYS'  AS code, 'CLO' AS dept_code UNION ALL
    SELECT 'Girls',           'GIRLS',          'CLO' UNION ALL
    SELECT 'Mens',            'MENS',           'CLO' UNION ALL
    SELECT 'Womens',          'WOMEN',          'CLO' UNION ALL
    SELECT 'Baby',            'BABY',           'CLO' UNION ALL
    SELECT 'Towels',          'TOWEL',          'DOM' UNION ALL
    SELECT 'Curtains/Drapes', 'CURT',           'DOM' UNION ALL
    SELECT 'Blankets',        'BLANK',          'DOM' UNION ALL
    SELECT 'Pillows',         'PILLW',          'DOM' UNION ALL
    SELECT 'Sheets',          'SHEET',          'DOM' UNION ALL
    SELECT 'Comforters',      'COMF',           'DOM' UNION ALL
    SELECT 'Throw Rugs',      'RUGS',           'DOM' UNION ALL
    SELECT 'Fabric Yards',    'YARDS',          'FAB' UNION ALL
    SELECT 'Utility',         'UTIL',           'FAB' UNION ALL
    SELECT 'Notions',         'NOT',            'FAB' UNION ALL
    SELECT 'Yarn',            'YARN',           'FAB' UNION ALL
    SELECT 'Food',            'FOOD',           'CON' UNION ALL
    SELECT 'HBC/HBA',         'HBC',            'CON' UNION ALL
    SELECT 'Laundry',         'LAUN',           'CON' UNION ALL
    SELECT 'Paper Goods',     'PAPER',          'CON' UNION ALL
    SELECT 'Art Supplies',    'ART',            'GEN' UNION ALL
    SELECT 'Batteries',       'BATT',           'GEN' UNION ALL
    SELECT 'BBQ Items',       'BBQ',            'GEN' UNION ALL
    SELECT 'Bird (Houses & Feed)', 'BIRD',      'GEN' UNION ALL
    SELECT 'Books',           'BOOKS',          'GEN' UNION ALL
    SELECT 'Camping',         'CAMP',           'GEN' UNION ALL
    SELECT 'Candles',         'CAND',           'GEN' UNION ALL
    SELECT 'Cleaning Supplies','CLEAN',         'GEN' UNION ALL
    SELECT 'Electronics',     'ELEC',           'GEN' UNION ALL
    SELECT 'Floor Cleaners',  'FLCLN',          'GEN' UNION ALL
    SELECT 'Frames',          'FRAME',          'GEN' UNION ALL
    SELECT 'Gift Supplies',   'GIFT',           'GEN' UNION ALL
    SELECT 'Greeting Cards',  'CARDS',          'GEN' UNION ALL
    SELECT 'Lawn Décor',      'LAWN',           'GEN' UNION ALL
    SELECT 'Luggage',         'LUGG',           'GEN' UNION ALL
    SELECT 'Office Supplies', 'OFFIC',          'GEN' UNION ALL
    SELECT 'Party Goods',     'PARTY',          'GEN' UNION ALL
    SELECT 'Planters',        'PLANT',          'GEN' UNION ALL
    SELECT 'Plastics (Trash Bags, Ziploc Bags, etc.)', 'PLAST', 'GEN' UNION ALL
    SELECT 'Toys',            'TOYS',           'GEN' UNION ALL
    SELECT 'Outdoor',         'OUTDR',          'GEN' UNION ALL
    SELECT 'Wall',            'WALL',           'GEN' UNION ALL
    SELECT 'Bakeware',        'BKW',            'HSW' UNION ALL
    SELECT 'Cookware',        'CKW',            'HSW' UNION ALL
    SELECT 'Dinnerware',      'DINN',           'HSW' UNION ALL
    SELECT 'Kitchen Gadgets', 'GADGE',          'HSW' UNION ALL
    SELECT 'Glassware',       'GLASS',          'HSW' UNION ALL
    SELECT 'Small Appliances','SMALL',          'HSW' UNION ALL
    SELECT 'Treats/Chews',    'TREAT',          'PETS' UNION ALL
    SELECT 'Pet Toys',        'PTOYS',          'PETS' UNION ALL
    SELECT 'Pet Food',        'PFOOD',          'PETS' UNION ALL
    SELECT 'Pet Beds',        'BEDS',           'PETS' UNION ALL
    SELECT 'Collars/Leashes', 'LEASH',          'PETS' UNION ALL
    SELECT 'Baseball',        'BASE',           'SPO' UNION ALL
    SELECT 'Basketball',      'BBALL',          'SPO' UNION ALL
    SELECT 'Soccer',          'SOCC',           'SPO' UNION ALL
    SELECT 'Ice Fishing',     'ICE',            'SPO' UNION ALL
    SELECT 'Football',        'FOOT',           'SPO' UNION ALL
    SELECT 'Fishing',         'FISH',           'SPO' UNION ALL
    SELECT 'Hunting',         'HUNT',           'SPO' UNION ALL
    SELECT 'Hockey',          'HOCK',           'SPO' UNION ALL
    SELECT 'Boating',         'BOAT',           'SPO' UNION ALL
    SELECT 'Playground Balls','PGB',            'SPO' UNION ALL
    SELECT 'Golf',            'GOLF',           'SPO' UNION ALL
    SELECT 'Fitness',         'FITN',           'SPO' UNION ALL
    SELECT 'Pickleball',      'PKL',            'SPO' UNION ALL
    SELECT 'Automotive',      'AUTO',           'HDW' UNION ALL
    SELECT 'Garden',          'GARD',           'HDW' UNION ALL
    SELECT 'Flashlights',     'FLASH',          'HDW' UNION ALL
    SELECT 'Work Gloves',     'GLOVE',          'HDW' UNION ALL
    SELECT 'Nuts & Bolts',    'NNB',            'HDW' UNION ALL
    SELECT 'Tarps',           'TARPS',          'HDW' UNION ALL
    SELECT 'Paint',           'PAINT',          'HDW' UNION ALL
    SELECT 'Rope',            'ROPE',           'HDW' UNION ALL
    SELECT 'Snow',            'SNOW',           'HDW' UNION ALL
    SELECT 'Hand Tools',      'HAND',           'HDW' UNION ALL
    SELECT 'Power Tools',     'POWER',          'HDW' UNION ALL
    SELECT 'Tape',            'TAPE',           'HDW' UNION ALL
    SELECT 'Mens',            'SMENS',          'SHO' UNION ALL
    SELECT 'Womens',          'SWMNS',          'SHO' UNION ALL
    SELECT 'Kids',            'SKIDS',          'SHO'
) AS c
JOIN departments d ON d.code = c.dept_code
WHERE NOT EXISTS (SELECT 1 FROM categories)