import React from 'react';
import './OrderDetail.css';

const OrderDetail = ({ order, onStatusUpdate, onClose }) => {
  const statusOptions = [
    { value: 'pending', label: '待处理' },
    { value: 'preparing', label: '制作中' },
    { value: 'delivering', label: '配送中' },
    { value: 'completed', label: '已完成' },
    { value: 'cancelled', label: '已取消' }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  return (
    <div className="order-detail">
      <div className="detail-header">
        <h2>订单详情 #{order.order_number}</h2>
        <button className="close-btn" onClick={onClose}>&times;</button>
      </div>

      <div className="detail-content">
        <div className="detail-section">
          <h3>订单状态</h3>
          <div className="status-control">
            <select
              value={order.status}
              onChange={(e) => onStatusUpdate(order.id, e.target.value)}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="detail-section">
          <h3>客户信息</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>姓名：</label>
              <span>{order.customer_name}</span>
            </div>
            <div className="info-item">
              <label>电话：</label>
              <span>{order.phone_number}</span>
            </div>
            <div className="info-item">
              <label>地址：</label>
              <span>{order.delivery_address}</span>
            </div>
            <div className="info-item">
              <label>下单时间：</label>
              <span>{formatDate(order.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>订单内容</h3>
          <div className="order-items">
            {order.items.map((item, index) => (
              <div key={index} className="order-item-detail">
                <div className="item-name">{item.name}</div>
                <div className="item-quantity">x{item.quantity}</div>
                <div className="item-price">¥{item.price.toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div className="order-total">
            <span>总计：</span>
            <span className="total-amount">¥{order.total_amount.toFixed(2)}</span>
          </div>
        </div>

        {order.notes && (
          <div className="detail-section">
            <h3>备注</h3>
            <div className="order-notes">{order.notes}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetail; 