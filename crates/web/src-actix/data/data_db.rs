use sqlx::MySqlTransaction;

const DATA_TABLE: &str = include_str!("../../sql/data.sql");

#[derive(sqlx::Type)]
#[repr(u8)]
enum DataTypes {
    Department = 0,
    Category = 1,
    SubCategory = 2,
    Season = 3,
}

pub async fn initialize_table<'a>(transaction: &mut MySqlTransaction<'a>) -> anyhow::Result<()> {
    sqlx::query(DATA_TABLE).execute(&mut **transaction).await?;

    Ok(())
}
