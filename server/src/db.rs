/**
 * 数据库操作模块
 * 提供所有与SQLite数据库交互的功能
 * 包括数据库初始化、订单的CRUD操作等
 */

use rusqlite::{Connection, Result as SqliteResult, params};
use crate::models::{Order, OrderItem, OrderStatus};
use std::sync::Mutex;
use std::str::FromStr;

/**
 * 应用状态结构体
 * 包含线程安全的数据库连接
 */
pub struct AppState {
    pub db: Mutex<Connection>, // 使用互斥锁保护的数据库连接
}

/**
 * 初始化数据库
 * 创建必要的数据表结构
 * 
 * @param conn - 数据库连接
 * @return SqliteResult<()> - 操作结果
 */
pub fn init_db(conn: &Connection) -> SqliteResult<()> {
    // 创建订单表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,    -- 订单ID
            order_number TEXT NOT NULL UNIQUE,       -- 订单编号（唯一）
            customer_name TEXT NOT NULL,             -- 客户姓名
            phone_number TEXT NOT NULL,              -- 联系电话
            delivery_address TEXT NOT NULL,          -- 配送地址
            latitude REAL NOT NULL,                  -- 配送地址纬度
            longitude REAL NOT NULL,                 -- 配送地址经度
            notes TEXT,                             -- 订单备注
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- 创建时间
            total_amount DECIMAL(10,2) NOT NULL,     -- 订单总金额
            status TEXT NOT NULL DEFAULT 'pending'   -- 订单状态
        )",
        params![],
    )?;

    // 创建订单项表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,    -- 订单项ID
            order_id INTEGER NOT NULL,               -- 关联的订单ID
            name TEXT NOT NULL,                      -- 商品名称
            quantity INTEGER NOT NULL,               -- 商品数量
            price REAL NOT NULL,                     -- 商品单价
            FOREIGN KEY (order_id) REFERENCES orders (id) -- 外键约束
        )",
        [],
    )?;

    Ok(())
}

/**
 * 根据订单编号查询订单
 * 
 * @param conn - 数据库连接
 * @param order_number - 订单编号
 * @return SqliteResult<Option<Order>> - 查询结果
 */
pub fn get_order_by_number(conn: &Connection, order_number: &str) -> SqliteResult<Option<Order>> {
    // 准备查询语句
    let mut stmt = conn.prepare(
        "SELECT id, order_number, customer_name, phone_number, delivery_address, 
                latitude, longitude, notes, created_at, total_amount, status 
         FROM orders 
         WHERE order_number = ?1"
    )?;

    let mut rows = stmt.query(params![order_number])?;

    // 解析查询结果
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
            items: get_order_items(conn, order_id)?, // 获取订单项
        };
        Ok(Some(order))
    } else {
        Ok(None)
    }
}

/**
 * 获取订单列表
 * 支持按状态筛选
 * 
 * @param conn - 数据库连接
 * @param status - 可选的状态过滤条件
 * @return SqliteResult<Vec<Order>> - 订单列表
 */
pub fn get_orders(conn: &Connection, status: Option<&str>) -> SqliteResult<Vec<Order>> {
    // 构建基础查询
    let mut query = String::from(
        "SELECT o.id, o.order_number, o.customer_name, o.phone_number, o.delivery_address, 
                o.latitude, o.longitude, o.notes, o.created_at, o.total_amount, o.status 
         FROM orders o"
    );

    // 添加状态过滤条件
    if let Some(_) = status {
        query.push_str(" WHERE o.status = ?1");
    }
    query.push_str(" ORDER BY o.created_at DESC");

    let mut stmt = conn.prepare(&query)?;
    
    // 执行查询
    let mut rows = if let Some(status_filter) = status {
        stmt.query(params![status_filter])?
    } else {
        stmt.query([])?
    };

    // 解析查询结果
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

/**
 * 更新订单状态
 * 
 * @param conn - 数据库连接
 * @param order_id - 订单ID
 * @param new_status - 新状态
 * @return SqliteResult<bool> - 是否更新成功
 */
pub fn update_order_status(conn: &Connection, order_id: i64, new_status: &str) -> SqliteResult<bool> {
    let result = conn.execute(
        "UPDATE orders SET status = ?1 WHERE id = ?2",
        params![new_status, order_id],
    )?;

    Ok(result > 0)
}

/**
 * 根据订单编号更新订单状态
 * 
 * @param conn - 数据库连接
 * @param order_number - 订单编号
 * @param new_status - 新状态
 * @return SqliteResult<bool> - 是否更新成功
 */
pub fn update_order_status_by_number(conn: &Connection, order_number: &str, new_status: &str) -> SqliteResult<bool> {
    let result = conn.execute(
        "UPDATE orders SET status = ?1 WHERE order_number = ?2",
        params![new_status, order_number],
    )?;

    Ok(result > 0)
}

/**
 * 创建新订单
 * 使用事务确保订单和订单项的原子性插入
 * 
 * @param conn - 数据库连接
 * @param order - 订单信息
 * @return SqliteResult<Order> - 创建的订单
 */
pub fn create_order(conn: &mut Connection, order: &Order) -> SqliteResult<Order> {
    // 开始事务
    let tx = conn.transaction()?;

    // 插入订单主表
    tx.execute(
        "INSERT INTO orders (order_number, customer_name, phone_number, delivery_address, latitude, longitude, notes, total_amount, status) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
        params![
            order.order_number,
            order.customer_name,
            order.phone_number,
            order.delivery_address,
            order.latitude,
            order.longitude,
            order.notes,
            order.total_amount,
            order.status.to_string(),
        ],
    )?;

    let order_id = tx.last_insert_rowid();

    // 插入订单项
    for item in &order.items {
        tx.execute(
            "INSERT INTO order_items (order_id, name, quantity, price) VALUES (?1, ?2, ?3, ?4)",
            params![order_id, item.name, item.quantity, item.price],
        )?;
    }

    // 提交事务
    tx.commit()?;

    Ok(order.clone())
}

/**
 * 获取订单的商品项列表
 * 
 * @param conn - 数据库连接
 * @param order_id - 订单ID
 * @return SqliteResult<Vec<OrderItem>> - 订单项列表
 */
pub fn get_order_items(conn: &Connection, order_id: i64) -> SqliteResult<Vec<OrderItem>> {
    let mut stmt = conn.prepare(
        "SELECT name, quantity, price FROM order_items WHERE order_id = ?1"
    )?;

    // 查询并映射结果
    let items = stmt.query_map(params![order_id], |row| {
        Ok(OrderItem {
            name: row.get(0)?,
            quantity: row.get(1)?,
            price: row.get(2)?,
        })
    })?;

    // 收集结果
    let mut result = Vec::new();
    for item in items {
        result.push(item?);
    }
    Ok(result)
}