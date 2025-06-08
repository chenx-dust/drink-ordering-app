use std::sync::mpsc::{channel, Sender};
use std::thread;
use std::time::Duration;
use serialport::{SerialPort, SerialPortType};
use serde::{Serialize, Deserialize};
use log::error;
use std::sync::{Arc, Mutex};
use crate::models::{Order, OrderStatus};
use std::str::FromStr;

const BAUD_RATE: u32 = 9600;
const SERIAL_TIMEOUT: Duration = Duration::from_millis(1000);

#[derive(Debug, Serialize, Deserialize)]
pub struct SerialMessage {
    message_type: String,
    order_number: String,
    status: Option<String>,
    items: Option<Vec<SerialOrderItem>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SerialOrderItem {
    name: String,
    quantity: i32,
}

pub struct SerialComm {
    port: Box<dyn SerialPort>,
    status_callback: Arc<Mutex<Box<dyn Fn(String, OrderStatus) + Send>>>,
}

impl SerialComm {
    pub fn new(port_name: &str, status_callback: Box<dyn Fn(String, OrderStatus) + Send>) -> anyhow::Result<Self> {
        let port = serialport::new(port_name, BAUD_RATE)
            .timeout(SERIAL_TIMEOUT)
            .open()?;

        Ok(SerialComm {
            port,
            status_callback: Arc::new(Mutex::new(status_callback)),
        })
    }

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

    pub fn start(&mut self) -> anyhow::Result<Sender<Order>> {
        let (tx, rx) = channel::<Order>();
        let mut port_clone = self.port.try_clone()?;
        let callback = Arc::clone(&self.status_callback);

        // 启动读取线程
        thread::spawn(move || {
            let mut serial_buf: Vec<u8> = vec![0; 1024];
            loop {
                match port_clone.read(serial_buf.as_mut_slice()) {
                    Ok(bytes_read) => {
                        if bytes_read > 0 {
                            if let Ok(message) = String::from_utf8(serial_buf[..bytes_read].to_vec()) {
                                if let Ok(serial_msg) = serde_json::from_str::<SerialMessage>(&message) {
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
                        if e.kind() != std::io::ErrorKind::TimedOut {
                            error!("Error reading from serial port: {}", e);
                        }
                        thread::sleep(Duration::from_secs(1));
                    }
                }
            }
        });

        // 启动写入线程
        let mut port_write = self.port.try_clone()?;
        thread::spawn(move || {
            while let Ok(order) = rx.recv() {
                let items = order.items.iter().map(|item| SerialOrderItem {
                    name: item.name.clone(),
                    quantity: item.quantity,
                }).collect();

                let message = SerialMessage {
                    message_type: "new_order".to_string(),
                    order_number: order.order_number,
                    status: None,
                    items: Some(items),
                };

                if let Ok(json) = serde_json::to_string(&message) {
                    let mut data = json.into_bytes();
                    data.push(b'\n');
                    if let Err(e) = port_write.write_all(&data) {
                        error!("Error writing to serial port: {}", e);
                    }
                }
            }
        });

        Ok(tx)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_list_ports() {
        let ports = SerialComm::list_ports();
        println!("Available ports: {:?}", ports);
    }
} 