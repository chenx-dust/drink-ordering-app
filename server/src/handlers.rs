/**
 * HTTP请求处理器模块
 * 处理所有与订单相关的HTTP请求
 * 包括创建订单、查询订单、更新订单状态等功能
 */

use actix_web::{web, HttpResponse, Result};
use uuid::Uuid;
use crate::db::{self, AppState};
use crate::models::{CreateOrderRequest, CreateOrderResponse, OrderList, OrderStatus, UpdateOrderStatusRequest, UpdateOrderStatusResponse, OrderQuery, Order};
use std::sync::mpsc::Sender;
use std::sync::Mutex;
use std::str::FromStr;

/**
 * 创建新订单的处理器
 * 
 * @param order_req - 订单创建请求
 * @param app_state - 应用状态（包含数据库连接）
 * @param order_sender - 订单发送器（用于串口通信）
 * @return Result<HttpResponse> - 包含订单创建结果的HTTP响应
 */
pub async fn create_order(
    order_req: web::Json<CreateOrderRequest>,
    app_state: web::Data<AppState>,
    order_sender: web::Data<Option<Mutex<Sender<Order>>>>,
) -> Result<HttpResponse> {
    let order_req = order_req.into_inner();
    let order_number = Uuid::new_v4().to_string();

    // 转换 CreateOrderRequest 到 Order
    let order = Order {
        id: 0, // 数据库会自动生成
        order_number,
        customer_name: order_req.customer_name,
        phone_number: order_req.phone_number,
        delivery_address: order_req.delivery_address,
        latitude: order_req.location.lat,
        longitude: order_req.location.lng,
        notes: order_req.notes,
        created_at: chrono::Local::now().naive_local().to_string(),
        total_amount: order_req.total_amount,
        status: OrderStatus::Pending,
        items: order_req.items.into_iter().map(|item| item.into()).collect(),
    };

    if let Ok(mut conn) = app_state.db.lock() {
        match db::create_order(&mut *conn, &order) {
            Ok(created_order) => {
                if let Some(sender) = order_sender.as_ref().as_ref().and_then(|a| a.lock().ok()) {
                    if let Err(e) = sender.send(created_order.clone()) {
                        log::error!("Failed to send order through serial port: {}", e);
                    }
                }
                Ok(HttpResponse::Ok().json(CreateOrderResponse {
                    success: true,
                    order_number: created_order.order_number,
                }))
            }
            Err(e) => {
                log::error!("Failed to create order: {}", e);
                Ok(HttpResponse::InternalServerError().json(CreateOrderResponse {
                    success: false,
                    order_number: String::new(),
                }))
            }
        }
    } else {
        Ok(HttpResponse::InternalServerError().json(CreateOrderResponse {
            success: false,
            order_number: String::new(),
        }))
    }
}

/**
 * 获取订单列表的处理器
 * 支持按状态筛选订单
 * 
 * @param app_state - 应用状态（包含数据库连接）
 * @param query - 查询参数（可选的状态过滤）
 * @return Result<HttpResponse> - 包含订单列表的HTTP响应
 */
pub async fn get_orders(
    app_state: web::Data<AppState>,
    query: web::Query<OrderQuery>,
) -> Result<HttpResponse> {
    if let Ok(db) = app_state.db.lock() {
        let status_filter = query.status.as_ref().and_then(|s| OrderStatus::from_str(s).ok());
        let status_str = status_filter.as_ref().map(|s| s.to_string());
        
        match db::get_orders(&db, status_str.as_deref()) {
            Ok(orders) => Ok(HttpResponse::Ok().json(OrderList { orders })),
            Err(e) => {
                log::error!("Failed to get orders: {}", e);
                Ok(HttpResponse::InternalServerError().finish())
            }
        }
    } else {
        Ok(HttpResponse::InternalServerError().finish())
    }
}

/**
 * 获取单个订单详情的处理器
 * 
 * @param app_state - 应用状态（包含数据库连接）
 * @param order_number - 订单编号
 * @return Result<HttpResponse> - 包含订单详情的HTTP响应
 */
pub async fn get_order(
    app_state: web::Data<AppState>,
    order_number: web::Path<String>,
) -> Result<HttpResponse> {
    if let Ok(db) = app_state.db.lock() {
        match db::get_order_by_number(&db, &order_number) {
            Ok(Some(order)) => Ok(HttpResponse::Ok().json(order)),
            Ok(None) => Ok(HttpResponse::NotFound().finish()),
            Err(e) => {
                log::error!("Failed to get order: {}", e);
                Ok(HttpResponse::InternalServerError().finish())
            }
        }
    } else {
        Ok(HttpResponse::InternalServerError().finish())
    }
}

/**
 * 更新订单状态的处理器
 * 
 * @param app_state - 应用状态（包含数据库连接）
 * @param order_id - 订单ID
 * @param status_update - 新的订单状态
 * @return Result<HttpResponse> - 包含更新结果的HTTP响应
 */
pub async fn update_order_status(
    app_state: web::Data<AppState>,
    order_id: web::Path<i64>,
    status_update: web::Json<UpdateOrderStatusRequest>,
) -> Result<HttpResponse> {
    if let Ok(db) = app_state.db.lock() {
        match db::update_order_status(&db, order_id.into_inner(), &status_update.status.to_string()) {
            Ok(true) => Ok(HttpResponse::Ok().json(UpdateOrderStatusResponse {
                success: true,
                message: None,
            })),
            Ok(false) => Ok(HttpResponse::NotFound().json(UpdateOrderStatusResponse {
                success: false,
                message: Some("Order not found".to_string()),
            })),
            Err(e) => {
                log::error!("Failed to update order status: {}", e);
                Ok(HttpResponse::InternalServerError().json(UpdateOrderStatusResponse {
                    success: false,
                    message: Some(format!("Failed to update order status: {}", e)),
                }))
            }
        }
    } else {
        Ok(HttpResponse::InternalServerError().finish())
    }
} 