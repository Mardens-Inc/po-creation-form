use calamine::{open_workbook_auto, Reader, Data};
use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ManifestData {
    pub columns: Vec<String>,
    pub rows: Vec<Vec<String>>,
    pub total_rows: usize,
}

pub fn parse_manifest(path: String) -> Result<ManifestData, String> {
    let path_obj = Path::new(&path);

    if !path_obj.exists() {
        return Err(format!("File not found: {}", path));
    }

    let extension = path_obj
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();

    match extension.as_str() {
        "xlsx" | "xls" | "xlsm" | "xlsb" => parse_excel(path),
        "csv" => parse_csv(path),
        "pdf" => parse_pdf(path),
        _ => Err(format!("Unsupported file format: .{}", extension)),
    }
}

fn parse_excel(path: String) -> Result<ManifestData, String> {
    let mut workbook = open_workbook_auto(&path)
        .map_err(|e| format!("Failed to open Excel file: {}", e))?;

    let sheet_names = workbook.sheet_names();
    if sheet_names.is_empty() {
        return Err("Excel file has no sheets".to_string());
    }

    let first_sheet_name = sheet_names[0].clone();
    let range = workbook
        .worksheet_range(&first_sheet_name)
        .map_err(|e| format!("Failed to read sheet '{}': {}", first_sheet_name, e))?;

    let mut rows_iter = range.rows();

    // Get column headers from first row
    let header_row = rows_iter
        .next()
        .ok_or("Excel file is empty")?;

    let columns: Vec<String> = header_row
        .iter()
        .map(cell_to_string)
        .collect();

    if columns.is_empty() {
        return Err("Excel file has no columns".to_string());
    }

    // Get up to 10 data rows
    let mut rows: Vec<Vec<String>> = Vec::new();
    let total_rows = range.height() - 1; // Subtract header row

    for row in rows_iter.take(3) {
        let row_data: Vec<String> = row
            .iter()
            .map(cell_to_string)
            .collect();
        rows.push(row_data);
    }

    Ok(ManifestData {
        columns,
        rows,
        total_rows,
    })
}

fn parse_csv(path: String) -> Result<ManifestData, String> {
    let mut reader = csv::ReaderBuilder::new()
        .flexible(true)
        .from_path(&path)
        .map_err(|e| format!("Failed to open CSV file: {}", e))?;

    // Get column headers
    let columns: Vec<String> = reader
        .headers()
        .map_err(|e| format!("Failed to read CSV headers: {}", e))?
        .iter()
        .map(|s| s.to_string())
        .collect();

    if columns.is_empty() {
        return Err("CSV file has no columns".to_string());
    }

    // Get up to 10 data rows
    let mut rows: Vec<Vec<String>> = Vec::new();
    let mut total_rows = 0;

    for result in reader.records() {
        total_rows += 1;
        if rows.len() < 10 {
            let record = result
                .map_err(|e| format!("Failed to read CSV row: {}", e))?;
            let row_data: Vec<String> = record
                .iter()
                .map(|s| s.to_string())
                .collect();
            rows.push(row_data);
        }
    }

    Ok(ManifestData {
        columns,
        rows,
        total_rows,
    })
}

fn parse_pdf(path: String) -> Result<ManifestData, String> {
    let text = pdf_extract::extract_text(&path)
        .map_err(|e| format!("Failed to extract text from PDF: {}", e))?;

    if text.trim().is_empty() {
        return Err("PDF file contains no text".to_string());
    }

    // Basic heuristic: Split by newlines and try to detect table structure
    let lines: Vec<&str> = text.lines().collect();

    if lines.is_empty() {
        return Err("PDF file contains no readable lines".to_string());
    }

    // Try to detect delimiter (tab, comma, pipe, or whitespace)
    let first_line = lines[0];
    let delimiter = if first_line.contains('\t') {
        '\t'
    } else if first_line.contains('|') {
        '|'
    } else if first_line.contains(',') {
        ','
    } else {
        // Use multiple spaces as delimiter
        return parse_pdf_whitespace_delimited(lines);
    };

    // Parse with detected delimiter
    let columns: Vec<String> = first_line
        .split(delimiter)
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .collect();

    if columns.is_empty() {
        return Err("Could not detect table structure in PDF".to_string());
    }

    let mut rows: Vec<Vec<String>> = Vec::new();
    let total_rows = lines.len() - 1;

    for line in lines.iter().skip(1).take(10) {
        let row_data: Vec<String> = line
            .split(delimiter)
            .map(|s| s.trim().to_string())
            .collect();

        // Only add rows with correct number of columns
        if row_data.len() == columns.len() {
            rows.push(row_data);
        }
    }

    Ok(ManifestData {
        columns,
        rows,
        total_rows,
    })
}

fn parse_pdf_whitespace_delimited(lines: Vec<&str>) -> Result<ManifestData, String> {
    let first_line = lines[0];

    // Split on multiple spaces (2 or more)
    let columns: Vec<String> = first_line
        .split("  ")
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .collect();

    if columns.is_empty() {
        return Err("Could not detect columns in PDF".to_string());
    }

    let mut rows: Vec<Vec<String>> = Vec::new();
    let total_rows = lines.len() - 1;

    for line in lines.iter().skip(1).take(10) {
        let row_data: Vec<String> = line
            .split("  ")
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty())
            .collect();

        if !row_data.is_empty() {
            rows.push(row_data);
        }
    }

    Ok(ManifestData {
        columns,
        rows,
        total_rows,
    })
}

fn cell_to_string(cell: &Data) -> String {
    match cell {
        Data::Empty => String::new(),
        Data::String(s) => s.clone(),
        Data::Float(f) => {
            // If it's a whole number, display without decimal
            if f.fract() == 0.0 {
                format!("{:.0}", f)
            } else {
                f.to_string()
            }
        }
        Data::Int(i) => i.to_string(),
        Data::Bool(b) => b.to_string(),
        Data::Error(e) => format!("#ERROR: {:?}", e),
        Data::DateTime(dt) => format!("{}", dt),
        Data::DateTimeIso(dt) => dt.to_string(),
        Data::DurationIso(d) => d.to_string(),
    }
}
