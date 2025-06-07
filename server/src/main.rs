mod db;
mod handlers;
mod models;

use actix_cors::Cors;
use actix_files::{Files, NamedFile};
use actix_web::{middleware::Logger, web, App, HttpServer, Result};
use rusqlite::Connection;
use std::sync::Mutex;

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

    let conn = Connection::open("orders.db").unwrap();
    db::init_db(&conn).unwrap();

    let app_state = web::Data::new(db::AppState {
        db: Mutex::new(conn),
    });

    log::info!("Server running at http://localhost:3001");

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header();

        App::new()
            .wrap(Logger::default())
            .wrap(cors)
            .app_data(app_state.clone())
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
    .bind("127.0.0.1:3001")?
    .run()
    .await
}
