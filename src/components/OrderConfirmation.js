import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import './OrderConfirmation.css';

const REFRESH_INTERVAL = 10000; // 每10秒刷新一次

// 模拟API调用函数，实际使用时替换为真实的API调用
const fetchOrderDetails = async (orderNumber) => {
  const response = await fetch(`/api/orders/${orderNumber}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('订单不存在');
    }
    throw new Error('获取订单信息失败');
  }
  
  return response.json();
};

const OrderConfirmation = () => {
  const { orderNumber } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 获取订单详情的函数
  const getOrderDetails = async () => {
    if (!orderNumber) {
      setError('订单号不存在');
      setLoading(false);
      return;
    }

    try {
      const details = await fetchOrderDetails(orderNumber);
      setOrderDetails(details);
    } catch (err) {
      setError(err.message || '获取订单信息失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载和定时刷新
  useEffect(() => {
    // 初始加载
    getOrderDetails();

    // 如果订单未完成，设置定时刷新
    const intervalId = setInterval(() => {
      if (orderDetails && !['completed', 'cancelled'].includes(orderDetails.status)) {
        getOrderDetails();
      }
    }, REFRESH_INTERVAL);

    // 清理定时器
    return () => clearInterval(intervalId);
  }, [orderNumber, orderDetails?.status]);

  const formatDate = (dateString) => {
    // 后端返回的日期格式是 "YYYY-MM-DD HH:mm:ss"，直接使用它
    return dateString.replace('T', ' ');
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'pending':
        return '您的订单正在排队中';
      case 'preparing':
        return '您的饮品正在制作中';
      case 'delivering':
        return '您的饮品正在配送中';
      case 'completed':
        return '您的订单已送达';
      case 'cancelled':
        return '您的订单已取消';
      default:
        return '订单状态未知';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-queuing';
      case 'preparing':
        return 'status-making';
      case 'delivering':
        return 'status-delivering';
      case 'completed':
        return 'status-delivered';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="order-confirmation">
        <div className="confirmation-card">
          <h2>加载中...</h2>
        </div>
      </div>
    );
  }

  if (error || !orderDetails) {
    console.log(error || '无法找到订单信息');
    return (
      <div className="order-confirmation">
        <div className="confirmation-card">
          <h2>{error || '无法找到订单信息'}</h2>
          <Link to="/" className="back-home-btn">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="order-confirmation">
      <div className="confirmation-card">
        <h2>订单状态</h2>
        <div className="order-info">
          <div className="order-header">
            <p>订单号：</p>
            <h3>{orderDetails.order_number}</h3>
            <p className="order-date">下单时间：{formatDate(orderDetails.created_at)}</p>
            <div className={`order-status ${getStatusClass(orderDetails.status)}`}>
              {getStatusMessage(orderDetails.status)}
            </div>
          </div>
          
          <div className="order-items">
            <h4>订单明细</h4>
            {orderDetails.items.map((item, index) => (
              <div key={index} className="order-item">
                <span className="item-name">{item.name}</span>
                <span className="item-quantity">x{item.quantity}</span>
                <span className="item-price">¥{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="order-total">
              <strong>总计：</strong>
              <span>¥{orderDetails.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <Link to="/" className="back-home-btn">
          返回首页
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmation; 