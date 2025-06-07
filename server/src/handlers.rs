use actix_web::{web, HttpResponse, Result};
use uuid::Uuid;

use crate::db::AppState;
use crate::models::{CreateOrderRequest, CreateOrderResponse, OrderList, OrderStatus, UpdateOrderStatusRequest, UpdateOrderStatusResponse, OrderQuery};

pub async fn create_order(
    data: web::Data<AppState>,
    order_req: web::Json<CreateOrderRequest>,
) -> Result<HttpResponse> {
    let order_number = Uuid::new_v4().to_string();
    let mut db = data.db.lock().unwrap();
    let tx = db.transaction().unwrap();

    match crate::db::create_order_with_items(
        &tx,
        &order_number,
        &order_req.customer_name,
        &order_req.phone_number,
        &order_req.delivery_address,
        order_req.location.lat,
        order_req.location.lng,
        order_req.notes.as_deref(),
        order_req.total_amount,
        &order_req.items,
    ) {
        Ok(_) => {
            tx.commit().unwrap();
            Ok(HttpResponse::Ok().json(CreateOrderResponse {
                success: true,
                order_number,
            }))
        }
        Err(e) => {
            tx.rollback().unwrap();
            Ok(HttpResponse::InternalServerError().json(format!("Failed to create order: {}", e)))
        }
    }
}

pub async fn get_orders(
    data: web::Data<AppState>,
    query: web::Query<OrderQuery>,
) -> Result<HttpResponse> {
    let db = data.db.lock().unwrap();
    let status_filter = query.status.as_ref().and_then(|s| OrderStatus::from_str(s));

    match crate::db::get_orders(&db, status_filter.as_ref().map(|s| s.as_str())) {
        Ok(orders) => Ok(HttpResponse::Ok().json(OrderList { orders })),
        Err(e) => Ok(HttpResponse::InternalServerError().json(format!(
            "Failed to get orders: {}",
            e
        ))),
    }
}

pub async fn get_order(
    data: web::Data<AppState>,
    order_number: web::Path<String>,
) -> Result<HttpResponse> {
    let db = data.db.lock().unwrap();

    match crate::db::get_order_by_number(&db, &order_number.into_inner()) {
        Ok(Some(order)) => Ok(HttpResponse::Ok().json(order)),
        Ok(None) => Ok(HttpResponse::NotFound().json("Order not found")),
        Err(e) => Ok(HttpResponse::InternalServerError().json(format!(
            "Failed to get order: {}",
            e
        ))),
    }
}

pub async fn update_order_status(
    data: web::Data<AppState>,
    order_id: web::Path<i64>,
    status_update: web::Json<UpdateOrderStatusRequest>,
) -> Result<HttpResponse> {
    let db = data.db.lock().unwrap();

    match crate::db::update_order_status(&db, order_id.into_inner(), status_update.status.as_str()) {
        Ok(true) => Ok(HttpResponse::Ok().json(UpdateOrderStatusResponse {
            success: true,
            message: Some("Order status updated successfully".to_string()),
        })),
        Ok(false) => Ok(HttpResponse::NotFound().json(UpdateOrderStatusResponse {
            success: false,
            message: Some("Order not found".to_string()),
        })),
        Err(e) => Ok(HttpResponse::InternalServerError().json(UpdateOrderStatusResponse {
            success: false,
            message: Some(format!("Failed to update order status: {}", e)),
        })),
    }
} 