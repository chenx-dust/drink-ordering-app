/**
 * 数据模型定义模块
 * 包含系统中所有的数据结构定义和相关实现
 * 主要包括订单、订单项、状态等模型
 */

use serde::{Deserialize, Serialize};
use std::fmt;
use std::str::FromStr;

/**
 * 订单项模型
 * 表示订单中的单个商品信息
 */
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OrderItem {
    pub name: String,     // 商品名称
    pub quantity: i32,    // 商品数量
    pub price: f64,       // 商品单价
}

/**
 * 订单项请求模型
 * 用于创建订单时的商品信息
 */
#[derive(Debug, Serialize, Deserialize)]
pub struct OrderItemRequest {
    pub name: String,     // 商品名称
    pub quantity: i32,    // 商品数量
    pub price: f64,       // 商品单价
}

/**
 * 实现从OrderItemRequest到OrderItem的转换
 */
impl From<OrderItemRequest> for OrderItem {
    fn from(item: OrderItemRequest) -> Self {
        OrderItem {
            name: item.name,
            quantity: item.quantity,
            price: item.price,
        }
    }
}

/**
 * 订单查询参数模型
 */
#[derive(Debug, Serialize, Deserialize)]
pub struct OrderQuery {
    pub status: Option<String>, // 可选的订单状态过滤条件
}

/**
 * 地理位置模型
 * 用于存储配送地址的经纬度信息
 */
#[derive(Debug, Serialize, Deserialize)]
pub struct Location {
    pub lat: f64,  // 纬度
    pub lng: f64,  // 经度
}

/**
 * 创建订单请求模型
 * 包含创建新订单所需的所有信息
 */
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateOrderRequest {
    pub customer_name: String,      // 客户姓名
    pub phone_number: String,       // 联系电话
    pub delivery_address: String,   // 配送地址
    pub location: Location,         // 地址坐标
    pub notes: Option<String>,      // 订单备注
    pub total_amount: f64,         // 订单总金额
    pub items: Vec<OrderItemRequest>, // 订单商品列表
}

/**
 * 创建订单响应模型
 */
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateOrderResponse {
    pub success: bool,        // 是否创建成功
    pub order_number: String, // 订单编号
}

/**
 * 订单状态枚举
 * 定义订单的所有可能状态
 */
#[derive(Debug, Clone)]
pub enum OrderStatus {
    Pending,    // 待处理
    Preparing,  // 制作中
    Delivering, // 配送中
    Completed,  // 已完成
    Cancelled,  // 已取消
}

/**
 * 实现从字符串到OrderStatus的转换
 * 允许将状态字符串解析为对应的枚举值
 */
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

/**
 * 实现OrderStatus的字符串表示
 * 用于将状态转换为字符串形式
 */
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

/**
 * 实现OrderStatus的序列化
 * 用于将状态转换为JSON字符串
 */
impl Serialize for OrderStatus {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

/**
 * 实现OrderStatus的反序列化
 * 用于从JSON字符串解析状态
 */
impl<'de> Deserialize<'de> for OrderStatus {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        Ok(OrderStatus::from_str(&s).unwrap())
    }
}

/**
 * 订单模型
 * 包含订单的完整信息
 */
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Order {
    pub id: i64,                  // 订单ID
    pub order_number: String,     // 订单编号
    pub customer_name: String,    // 客户姓名
    pub phone_number: String,     // 联系电话
    pub delivery_address: String, // 配送地址
    pub latitude: f64,           // 配送地址纬度
    pub longitude: f64,          // 配送地址经度
    pub notes: Option<String>,    // 订单备注
    pub created_at: String,       // 创建时间
    pub total_amount: f64,       // 订单总金额
    pub status: OrderStatus,      // 订单状态
    pub items: Vec<OrderItem>,    // 订单商品列表
}

/**
 * 订单列表响应模型
 */
#[derive(Debug, Serialize, Deserialize)]
pub struct OrderList {
    pub orders: Vec<Order>, // 订单列表
}

/**
 * 更新订单状态请求模型
 */
#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateOrderStatusRequest {
    pub status: OrderStatus, // 新的订单状态
}

/**
 * 更新订单状态响应模型
 */
#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateOrderStatusResponse {
    pub success: bool,           // 是否更新成功
    pub message: Option<String>, // 可选的响应消息
} 