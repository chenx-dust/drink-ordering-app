/**
 * 串口通信模块
 * 负责与外部设备（如打印机、制作设备等）进行串口通信
 * 实现订单信息的发送和状态更新的接收
 */

use std::sync::mpsc::{channel, Sender};
use std::thread;
use std::time::Duration;
use serialport::{SerialPort, SerialPortType};
use serde::{Serialize, Deserialize};
use log::error;
use std::sync::{Arc, Mutex};
use crate::models::{Order, OrderStatus};
use std::str::FromStr;

// 串口通信配置常量
const BAUD_RATE: u32 = 9600;           // 波特率
const SERIAL_TIMEOUT: Duration = Duration::from_millis(1000); // 超时时间

/**
 * 串口通信消息结构
 * 用于序列化和反序列化与设备的通信内容
 */
#[derive(Debug, Serialize, Deserialize)]
pub struct SerialMessage {
    message_type: String,      // 消息类型（如"new_order"或"status_update"）
    order_number: String,      // 订单编号
    status: Option<String>,    // 可选的订单状态
    items: Option<Vec<SerialOrderItem>>, // 可选的订单项列表
}

/**
 * 串口订单项结构
 * 用于向设备发送订单中的商品信息
 */
#[derive(Debug, Serialize, Deserialize)]
pub struct SerialOrderItem {
    name: String,     // 商品名称
    quantity: i32,    // 商品数量
}

/**
 * 串口通信管理器
 * 处理与外部设备的双向通信
 */
pub struct SerialComm {
    port: Box<dyn SerialPort>,  // 串口实例
    status_callback: Arc<Mutex<Box<dyn Fn(String, OrderStatus) + Send>>>, // 状态更新回调函数
}

impl SerialComm {
    /**
     * 创建新的串口通信实例
     * 
     * @param port_name - 串口设备名称
     * @param status_callback - 状态更新回调函数
     * @return Result<SerialComm> - 串口通信实例
     */
    pub fn new(port_name: &str, status_callback: Box<dyn Fn(String, OrderStatus) + Send>) -> anyhow::Result<Self> {
        // 配置并打开串口
        let port = serialport::new(port_name, BAUD_RATE)
            .timeout(SERIAL_TIMEOUT)
            .open()?;

        Ok(SerialComm {
            port,
            status_callback: Arc::new(Mutex::new(status_callback)),
        })
    }

    /**
     * 列出可用的串口设备
     * 仅返回USB类型的串口设备
     * 
     * @return Vec<String> - 可用串口设备列表
     */
    pub fn list_ports() -> Vec<String> {
        match serialport::available_ports() {
            Ok(ports) => ports
                .into_iter()
                .filter_map(|p| {
                    if let SerialPortType::UsbPort(_) = p.port_type {
                        Some(p.port_name)
                    } else {
                        None
                    }
                })
                .collect(),
            Err(_) => Vec::new(),
        }
    }

    /**
     * 启动串口通信
     * 创建读写线程处理双向通信
     * 
     * @return Result<Sender<Order>> - 订单发送通道
     */
    pub fn start(&mut self) -> anyhow::Result<Sender<Order>> {
        let (tx, rx) = channel::<Order>();
        let mut port_clone = self.port.try_clone()?;
        let callback = Arc::clone(&self.status_callback);

        // 启动读取线程 - 处理来自设备的状态更新
        thread::spawn(move || {
            let mut serial_buf: Vec<u8> = vec![0; 1024];
            loop {
                match port_clone.read(serial_buf.as_mut_slice()) {
                    Ok(bytes_read) => {
                        if bytes_read > 0 {
                            // 尝试解析接收到的数据
                            if let Ok(message) = String::from_utf8(serial_buf[..bytes_read].to_vec()) {
                                if let Ok(serial_msg) = serde_json::from_str::<SerialMessage>(&message) {
                                    // 处理状态更新消息
                                    if serial_msg.message_type == "status_update" {
                                        log::info!("Received status update for order {}", serial_msg.order_number);
                                        if let (Some(status_str), Some(callback)) = (serial_msg.status, callback.lock().ok()) {
                                            if let Ok(status) = OrderStatus::from_str(&status_str) {
                                                callback(serial_msg.order_number, status);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    Err(e) => {
                        // 处理读取错误，超时错误可以忽略
                        if e.kind() != std::io::ErrorKind::TimedOut {
                            error!("Error reading from serial port: {}", e);
                        }
                        thread::sleep(Duration::from_secs(1));
                    }
                }
            }
        });

        // 启动写入线程 - 发送新订单到设备
        let mut port_write = self.port.try_clone()?;
        thread::spawn(move || {
            while let Ok(order) = rx.recv() {
                // 转换订单项为设备可识别的格式
                let items = order.items.iter().map(|item| SerialOrderItem {
                    name: item.name.clone(),
                    quantity: item.quantity,
                }).collect();

                // 构建新订单消息
                let message = SerialMessage {
                    message_type: "new_order".to_string(),
                    order_number: order.order_number,
                    status: None,
                    items: Some(items),
                };

                // 序列化并发送消息
                if let Ok(json) = serde_json::to_string(&message) {
                    let mut data = json.into_bytes();
                    data.push(b'\n'); // 添加换行符作为消息结束标记
                    if let Err(e) = port_write.write_all(&data) {
                        error!("Error writing to serial port: {}", e);
                    }
                }
            }
        });

        Ok(tx)
    }
}

/**
 * 单元测试模块
 */
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_list_ports() {
        let ports = SerialComm::list_ports();
        println!("Available ports: {:?}", ports);
    }
} 