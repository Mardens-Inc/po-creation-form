export const TEMPLATE_FIELDS = [
    'item_number',
    'upc',
    'description',
    'case_pack',
    'cases',
    'mardens_cost',
    'mardens_price',
    'comp_retail',
    'department',
    'category',
    'sub_category',
    'season',
    'notes'
] as const;

export type TemplateField = typeof TEMPLATE_FIELDS[number];

export type ManifestData = {
    columns: string[];
    rows: string[][];
    total_rows: number;
}

export const TEMPLATE_FIELD_LABELS: Record<TemplateField, string> = {
    item_number: 'Item Number',
    upc: 'UPC',
    description: 'Description',
    case_pack: 'Case Pack',
    cases: 'Cases',
    mardens_cost: 'Mardens Cost',
    mardens_price: 'Mardens Price',
    comp_retail: 'Comp Retail',
    department: 'Department',
    category: 'Category',
    sub_category: 'Sub Category',
    season: 'Season',
    notes: 'Notes'
};

export const REQUIRED_FIELDS: TemplateField[] = ['item_number', 'description', 'department'];
