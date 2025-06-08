use serde::{Deserialize, Serialize};
use std::fmt;
use std::str::FromStr;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OrderItem {
    pub name: String,
    pub quantity: i32,
    pub price: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OrderItemRequest {
    pub name: String,
    pub quantity: i32,
    pub price: f64,
}

impl From<OrderItemRequest> for OrderItem {
    fn from(item: OrderItemRequest) -> Self {
        OrderItem {
            name: item.name,
            quantity: item.quantity,
            price: item.price,
        }
    }
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
    pub customer_name: String,
    pub phone_number: String,
    pub delivery_address: String,
    pub location: Location,
    pub notes: Option<String>,
    pub total_amount: f64,
    pub items: Vec<OrderItemRequest>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateOrderResponse {
    pub success: bool,
    pub order_number: String,
}

#[derive(Debug, Clone)]
pub enum OrderStatus {
    Pending,    // 待处理
    Preparing,  // 制作中
    Delivering, // 配送中
    Completed,  // 已完成
    Cancelled,  // 已取消
}

impl FromStr for OrderStatus {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "pending" => Ok(OrderStatus::Pending),
            "preparing" => Ok(OrderStatus::Preparing),
            "delivering" => Ok(OrderStatus::Delivering),
            "completed" => Ok(OrderStatus::Completed),
            "cancelled" => Ok(OrderStatus::Cancelled),
            _ => Err(format!("Invalid status: {}", s)),
        }
    }
}

impl fmt::Display for OrderStatus {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            OrderStatus::Pending => write!(f, "pending"),
            OrderStatus::Preparing => write!(f, "preparing"),
            OrderStatus::Delivering => write!(f, "delivering"),
            OrderStatus::Completed => write!(f, "completed"),
            OrderStatus::Cancelled => write!(f, "cancelled"),
        }
    }
}

impl Serialize for OrderStatus {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

impl<'de> Deserialize<'de> for OrderStatus {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        Ok(OrderStatus::from_str(&s).unwrap())
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
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