use anyhow::Result;
use serde::Serialize;
use sqlx::MySqlTransaction;

// Schema SQL
const DEPARTMENTS_TABLE: &str = include_str!("../../sql/departments.sql");
const DEPARTMENTS_SEED: &str = include_str!("../../sql/departments_seed.sql");
const CATEGORIES_TABLE: &str = include_str!("../../sql/categories.sql");
const CATEGORIES_SEED: &str = include_str!("../../sql/categories_seed.sql");
const SUBCATEGORIES_TABLE: &str = include_str!("../../sql/subcategories.sql");
const SUBCATEGORIES_SEED: &str = include_str!("../../sql/subcategories_seed.sql");
const SEASONS_TABLE: &str = include_str!("../../sql/seasons.sql");
const SEASONS_SEED: &str = include_str!("../../sql/seasons_seed.sql");

#[derive(Debug, sqlx::FromRow, Serialize)]
pub struct Department {
    pub id: u32,
    pub name: String,
    pub code: String,
}

#[derive(Debug, sqlx::FromRow, Serialize)]
pub struct Category {
    pub id: u32,
    pub name: String,
    pub code: String,
    pub department_id: u32,
}

#[derive(Debug, sqlx::FromRow, Serialize)]
pub struct Subcategory {
    pub id: u32,
    pub name: String,
    pub code: String,
    pub category_id: u32,
}

#[derive(Debug, sqlx::FromRow, Serialize)]
pub struct Season {
    pub id: u32,
    pub name: String,
}

pub async fn initialize_table<'a>(transaction: &mut MySqlTransaction<'a>) -> anyhow::Result<()> {
    sqlx::query(DEPARTMENTS_TABLE).execute(&mut **transaction).await?;
    sqlx::query(DEPARTMENTS_SEED).execute(&mut **transaction).await?;
    sqlx::query(CATEGORIES_TABLE).execute(&mut **transaction).await?;
    sqlx::query(CATEGORIES_SEED).execute(&mut **transaction).await?;
    sqlx::query(SUBCATEGORIES_TABLE).execute(&mut **transaction).await?;
    sqlx::query(SUBCATEGORIES_SEED).execute(&mut **transaction).await?;
    sqlx::query(SEASONS_TABLE).execute(&mut **transaction).await?;
    sqlx::query(SEASONS_SEED).execute(&mut **transaction).await?;
    Ok(())
}

// -- Query functions (standalone pool pattern) --

pub async fn get_all_departments() -> Result<Vec<Department>> {
    let pool = crate::app_db::create_pool().await?;
    let mut transaction = pool.begin().await?;
    let departments: Vec<Department> =
        sqlx::query_as(r#"SELECT id, name, code FROM departments ORDER BY name"#)
            .fetch_all(&mut *transaction)
            .await?;
    transaction.commit().await?;
    pool.close().await;
    Ok(departments)
}

pub async fn get_categories_by_department(department_id: u32) -> Result<Vec<Category>> {
    let pool = crate::app_db::create_pool().await?;
    let mut transaction = pool.begin().await?;
    let categories: Vec<Category> =
        sqlx::query_as(r#"SELECT id, name, code, department_id FROM categories WHERE department_id = ? ORDER BY name"#)
            .bind(department_id)
            .fetch_all(&mut *transaction)
            .await?;
    transaction.commit().await?;
    pool.close().await;
    Ok(categories)
}

pub async fn get_subcategories_by_category(category_id: u32) -> Result<Vec<Subcategory>> {
    let pool = crate::app_db::create_pool().await?;
    let mut transaction = pool.begin().await?;
    let subcategories: Vec<Subcategory> =
        sqlx::query_as(r#"SELECT id, name, code, category_id FROM subcategories WHERE category_id = ? ORDER BY name"#)
            .bind(category_id)
            .fetch_all(&mut *transaction)
            .await?;
    transaction.commit().await?;
    pool.close().await;
    Ok(subcategories)
}

pub async fn get_all_seasons() -> Result<Vec<Season>> {
    let pool = crate::app_db::create_pool().await?;
    let mut transaction = pool.begin().await?;
    let seasons: Vec<Season> =
        sqlx::query_as(r#"SELECT id, name FROM seasons ORDER BY id"#)
            .fetch_all(&mut *transaction)
            .await?;
    transaction.commit().await?;
    pool.close().await;
    Ok(seasons)
}
