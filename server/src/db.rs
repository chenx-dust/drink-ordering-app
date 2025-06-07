use rusqlite::{params, Connection, Result as SqliteResult};
use std::sync::Mutex;
use crate::models::{Order, OrderItem, OrderStatus};

pub struct AppState {
    pub db: Mutex<Connection>,
}

pub fn init_db(conn: &Connection) -> SqliteResult<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_number TEXT UNIQUE NOT NULL,
            customer_name TEXT NOT NULL,
            phone_number TEXT NOT NULL,
            delivery_address TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            total_amount DECIMAL(10,2) NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending'
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            name TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders (id)
        )",
        [],
    )?;

    Ok(())
}

pub fn create_order_with_items(
    tx: &Connection,
    order_number: &str,
    customer_name: &str,
    phone_number: &str,
    delivery_address: &str,
    latitude: f64,
    longitude: f64,
    notes: Option<&str>,
    total_amount: f64,
    items: &[OrderItem],
) -> SqliteResult<()> {
    tx.execute(
        "INSERT INTO orders (order_number, customer_name, phone_number, delivery_address, latitude, longitude, notes, total_amount, status) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
        params![
            order_number,
            customer_name,
            phone_number,
            delivery_address,
            latitude,
            longitude,
            notes,
            total_amount,
            OrderStatus::Pending.as_str()
        ],
    )?;

    let order_id = tx.last_insert_rowid();

    for item in items {
        tx.execute(
            "INSERT INTO order_items (order_id, name, quantity, price) VALUES (?1, ?2, ?3, ?4)",
            params![order_id, item.name, item.quantity, item.price],
        )?;
    }

    Ok(())
}

pub fn get_orders(conn: &Connection, status: Option<&str>) -> SqliteResult<Vec<Order>> {
    let mut query = String::from(
        "SELECT o.id, o.order_number, o.customer_name, o.phone_number, o.delivery_address, 
                o.latitude, o.longitude, o.notes, o.created_at, o.total_amount, o.status 
         FROM orders o"
    );

    if let Some(_) = status {
        query.push_str(" WHERE o.status = ?1");
    }
    query.push_str(" ORDER BY o.created_at DESC");

    let mut stmt = conn.prepare(&query)?;
    
    let mut rows = if let Some(status_filter) = status {
        stmt.query(params![status_filter])?
    } else {
        stmt.query([])?
    };

    let mut orders = Vec::new();
    while let Some(row) = rows.next()? {
        let order_id: i64 = row.get(0)?;
        let order = Order {
            id: order_id,
            order_number: row.get(1)?,
            customer_name: row.get(2)?,
            phone_number: row.get(3)?,
            delivery_address: row.get(4)?,
            latitude: row.get(5)?,
            longitude: row.get(6)?,
            notes: row.get(7)?,
            created_at: row.get(8)?,
            total_amount: row.get(9)?,
            status: OrderStatus::from_str(&row.get::<_, String>(10)?).unwrap_or(OrderStatus::Pending),
            items: get_order_items(conn, order_id)?,
        };
        orders.push(order);
    }

    Ok(orders)
}

pub fn get_order_items(conn: &Connection, order_id: i64) -> SqliteResult<Vec<OrderItem>> {
    let mut stmt = conn.prepare(
        "SELECT name, quantity, price FROM order_items WHERE order_id = ?1"
    )?;

    let items = stmt.query_map(params![order_id], |row| {
        Ok(OrderItem {
            name: row.get(0)?,
            quantity: row.get(1)?,
            price: row.get(2)?,
        })
    })?;

    let mut result = Vec::new();
    for item in items {
        result.push(item?);
    }
    Ok(result)
}

pub fn update_order_status(conn: &Connection, order_id: i64, new_status: &str) -> SqliteResult<bool> {
    let rows_affected = conn.execute(
        "UPDATE orders SET status = ?1 WHERE id = ?2",
        params![new_status, order_id],
    )?;

    Ok(rows_affected > 0)
}

pub fn get_order_by_number(conn: &Connection, order_number: &str) -> SqliteResult<Option<Order>> {
    let mut stmt = conn.prepare(
        "SELECT id, order_number, customer_name, phone_number, delivery_address, 
                latitude, longitude, notes, created_at, total_amount, status 
         FROM orders 
         WHERE order_number = ?1"
    )?;

    let mut rows = stmt.query(params![order_number])?;

    if let Some(row) = rows.next()? {
        let order_id: i64 = row.get(0)?;
        let order = Order {
            id: order_id,
            order_number: row.get(1)?,
            customer_name: row.get(2)?,
            phone_number: row.get(3)?,
            delivery_address: row.get(4)?,
            latitude: row.get(5)?,
            longitude: row.get(6)?,
            notes: row.get(7)?,
            created_at: row.get(8)?,
            total_amount: row.get(9)?,
            status: OrderStatus::from_str(&row.get::<_, String>(10)?).unwrap_or(OrderStatus::Pending),
            items: get_order_items(conn, order_id)?,
        };
        Ok(Some(order))
    } else {
        Ok(None)
    }
} 