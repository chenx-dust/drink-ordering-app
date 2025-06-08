mod db;
mod handlers;
mod models;
mod serial_comm;

use actix_cors::Cors;
use actix_files::{Files, NamedFile};
use actix_web::{middleware::Logger, web, App, HttpServer, Result};
use rusqlite::Connection;
use std::sync::Mutex;
use serial_comm::SerialComm;
use std::env;

// 处理客户端路由的 index.html
async fn index() -> Result<NamedFile> {
    Ok(NamedFile::open("../build/index.html")?)
}

// 处理管理后台路由的 index.html
async fn admin_index() -> Result<NamedFile> {
    Ok(NamedFile::open("../build/admin/index.html")?)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    // 获取串口名称
    let port_name = env::var("SERIAL_PORT").ok().or_else(|| {
        // 如果环境变量未设置，尝试自动检测串口
        let ports = SerialComm::list_ports();
        ports.first().map(|p| p.clone())
    });

    let conn = Connection::open("orders.db").unwrap();
    db::init_db(&conn).unwrap();
    let db_conn = web::Data::new(db::AppState {
        db: Mutex::new(conn),
    });

    // 创建串口通信实例
    let db_clone = db_conn.clone();
    let serial_comm = port_name.clone().and_then(|pn| SerialComm::new(&pn, Box::new(move |order_number, status| {
        if let Ok(conn) = db_clone.db.lock() {
            if let Err(e) = db::update_order_status_by_number(&conn, &order_number, &status.to_string()) {
                log::error!("Failed to update order status: {}", e);
            }
        }
    })).ok());

    let serial_comm = serial_comm.and_then(
            |mut sc| sc.start().map_err(|e| log::error!("Failed to start serial communication: {}", e)).ok());

    let order_sender = web::Data::new(
        serial_comm.map(|sc| Mutex::new(sc))
    );

    let listen_addr = env::var("LISTEN_ADDR").unwrap_or("127.0.0.1:3001".to_string());
    log::info!("Server running at http://{}", listen_addr);
    if let Some(pn) = port_name {
        log::info!("Using serial port: {}", pn);
    } else {
        log::info!("No serial port found");
    }

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header();

        App::new()
            .wrap(Logger::default())
            .wrap(cors)
            .app_data(db_conn.clone())
            .app_data(order_sender.clone())
            .service(
                web::scope("/api")
                    .route("/orders/create", web::post().to(handlers::create_order))
                    .route("/orders", web::get().to(handlers::get_orders))
                    .route("/orders/{order_number}", web::get().to(handlers::get_order))
                    .route("/orders/{order_id}/status", web::put().to(handlers::update_order_status)),
            )
            .service(Files::new("/", "../build").index_file("index.html"))
            .service(
                web::scope("/admin")
                    .route("", web::get().to(admin_index))
                    .route("/", web::get().to(admin_index))
                    .default_service(web::route().to(admin_index))
            )
            .default_service(web::route().to(index))
    })
    .bind(listen_addr)?
    .run()
    .await
}
