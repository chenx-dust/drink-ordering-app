/**
 * 饮品订购系统后端服务器入口文件
 * 负责初始化数据库、串口通信和HTTP服务器
 * 提供API路由和静态文件服务
 */

// 导入自定义模块
mod db;         // 数据库操作模块
mod handlers;   // HTTP请求处理器模块
mod models;     // 数据模型模块
mod serial_comm; // 串口通信模块

// 导入外部依赖
use actix_cors::Cors;
use actix_files::{Files, NamedFile};
use actix_web::{middleware::Logger, web, App, HttpServer, Result};
use rusqlite::Connection;
use std::sync::Mutex;
use serial_comm::SerialComm;
use std::env;

/**
 * 处理前端路由的回退路由处理器
 * 返回前端应用的index.html文件
 */
async fn index() -> Result<NamedFile> {
    Ok(NamedFile::open("../build/index.html")?)
}

/**
 * 处理管理后台路由的回退路由处理器
 * 返回管理后台的index.html文件
 */
async fn admin_index() -> Result<NamedFile> {
    Ok(NamedFile::open("../build/admin/index.html")?)
}

/**
 * 应用程序入口函数
 * 初始化各个组件并启动HTTP服务器
 */
#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // 初始化日志系统
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    // 配置串口
    // 优先使用环境变量中的串口配置，如果未设置则尝试自动检测
    let port_name = env::var("SERIAL_PORT").ok().or_else(|| {
        let ports = SerialComm::list_ports();
        ports.first().map(|p| p.clone())
    });

    // 初始化数据库连接
    let conn = Connection::open("orders.db").unwrap();
    db::init_db(&conn).unwrap();
    let db_conn = web::Data::new(db::AppState {
        db: Mutex::new(conn),
    });

    // 初始化串口通信
    // 创建一个回调函数用于处理订单状态更新
    let db_clone = db_conn.clone();
    let serial_comm = port_name.clone().and_then(|pn| SerialComm::new(&pn, Box::new(move |order_number, status| {
        if let Ok(conn) = db_clone.db.lock() {
            if let Err(e) = db::update_order_status_by_number(&conn, &order_number, &status.to_string()) {
                log::error!("Failed to update order status: {}", e);
            }
        }
    })).ok());

    // 启动串口通信
    let serial_comm = serial_comm.and_then(
            |mut sc| sc.start().map_err(|e| log::error!("Failed to start serial communication: {}", e)).ok());

    // 创建串口通信共享状态
    let order_sender = web::Data::new(
        serial_comm.map(|sc| Mutex::new(sc))
    );

    // 获取服务器监听地址，默认为127.0.0.1:3001
    let listen_addr = env::var("LISTEN_ADDR").unwrap_or("127.0.0.1:3001".to_string());
    log::info!("Server running at http://{}", listen_addr);
    if let Some(pn) = port_name {
        log::info!("Using serial port: {}", pn);
    } else {
        log::info!("No serial port found");
    }

    // 配置并启动HTTP服务器
    HttpServer::new(move || {
        // 配置CORS
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header();

        // 构建应用实例
        App::new()
            .wrap(Logger::default()) // 启用请求日志记录
            .wrap(cors)             // 启用CORS
            .app_data(db_conn.clone()) // 注入数据库连接
            .app_data(order_sender.clone()) // 注入串口通信实例
            // API路由配置
            .service(
                web::scope("/api")
                    .route("/orders/create", web::post().to(handlers::create_order))
                    .route("/orders", web::get().to(handlers::get_orders))
                    .route("/orders/{order_number}", web::get().to(handlers::get_order))
                    .route("/orders/{order_id}/status", web::put().to(handlers::update_order_status)),
            )
            // 静态文件服务
            .service(Files::new("/", "../build").index_file("index.html"))
            // 管理后台路由
            .service(
                web::scope("/admin")
                    .route("", web::get().to(admin_index))
                    .route("/", web::get().to(admin_index))
                    .default_service(web::route().to(admin_index))
            )
            // 默认路由处理
            .default_service(web::route().to(index))
    })
    .bind(listen_addr)? // 绑定服务器地址
    .run()             // 运行服务器
    .await
}
