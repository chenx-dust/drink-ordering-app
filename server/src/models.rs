use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct OrderItem {
    pub name: String,
    pub quantity: i32,
    pub price: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OrderQuery {
    pub status: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Location {
    pub lat: f64,
    pub lng: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateOrderRequest {
    pub items: Vec<OrderItem>,
    pub total_amount: f64,
    pub customer_name: String,
    pub phone_number: String,
    pub delivery_address: String,
    pub location: Location,
    pub notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateOrderResponse {
    pub success: bool,
    pub order_number: String,
}

#[derive(Debug, Serialize, Deserialize, PartialEq, Clone)]
#[serde(rename_all = "snake_case")]
pub enum OrderStatus {
    Pending,    // 待处理
    Preparing,  // 制作中
    Delivering, // 配送中
    Completed,  // 已完成
    Cancelled,  // 已取消
}

impl OrderStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            OrderStatus::Pending => "pending",
            OrderStatus::Preparing => "preparing",
            OrderStatus::Delivering => "delivering",
            OrderStatus::Completed => "completed",
            OrderStatus::Cancelled => "cancelled",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "pending" => Some(OrderStatus::Pending),
            "preparing" => Some(OrderStatus::Preparing),
            "delivering" => Some(OrderStatus::Delivering),
            "completed" => Some(OrderStatus::Completed),
            "cancelled" => Some(OrderStatus::Cancelled),
            _ => None,
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Order {
    pub id: i64,
    pub order_number: String,
    pub customer_name: String,
    pub phone_number: String,
    pub delivery_address: String,
    pub latitude: f64,
    pub longitude: f64,
    pub notes: Option<String>,
    pub created_at: String,
    pub total_amount: f64,
    pub status: OrderStatus,
    pub items: Vec<OrderItem>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OrderList {
    pub orders: Vec<Order>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateOrderStatusRequest {
    pub status: OrderStatus,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateOrderStatusResponse {
    pub success: bool,
    pub message: Option<String>,
} 