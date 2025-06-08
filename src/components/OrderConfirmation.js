/**
 * 订单确认组件
 * 显示订单详情和实时状态
 * 支持自动刷新未完成订单的状态
 */

import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import './OrderConfirmation.css';

// 订单状态刷新间隔（毫秒）
const REFRESH_INTERVAL = 10000; // 每10秒刷新一次

/**
 * 获取订单详情的API调用
 * @param {string} orderNumber - 订单号
 * @returns {Promise} 包含订单详情的Promise
 * @throws {Error} 当订单不存在或API调用失败时抛出错误
 */
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
  // 从URL参数中获取订单号
  const { orderNumber } = useParams();
  
  // 状态管理
  const [orderDetails, setOrderDetails] = useState(null); // 订单详情
  const [loading, setLoading] = useState(true); // 加载状态
  const [error, setError] = useState(null); // 错误信息

  /**
   * 获取订单详情
   * 处理加载状态和错误情况
   */
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

  /**
   * 处理订单详情的初始加载和自动刷新
   * 对于未完成的订单，每隔一定时间自动刷新状态
   */
  useEffect(() => {
    // 初始加载订单详情
    getOrderDetails();

    // 如果订单未完成，设置定时刷新
    const intervalId = setInterval(() => {
      if (orderDetails && !['completed', 'cancelled'].includes(orderDetails.status)) {
        getOrderDetails();
      }
    }, REFRESH_INTERVAL);

    // 组件卸载时清理定时器
    return () => clearInterval(intervalId);
  }, [orderNumber, orderDetails?.status]);

  /**
   * 格式化日期显示
   * @param {string} dateString - ISO格式的日期字符串
   * @returns {string} 格式化后的日期字符串
   */
  const formatDate = (dateString) => {
    return dateString.replace('T', ' ');
  };

  /**
   * 获取订单状态对应的提示文本
   * @param {string} status - 订单状态
   * @returns {string} 状态提示文本
   */
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

  /**
   * 获取订单状态对应的CSS类名
   * @param {string} status - 订单状态
   * @returns {string} CSS类名
   */
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

  // 加载中状态显示
  if (loading) {
    return (
      <div className="order-confirmation">
        <div className="confirmation-card">
          <h2>加载中...</h2>
        </div>
      </div>
    );
  }

  // 错误状态显示
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

  // 订单详情显示
  return (
    <div className="order-confirmation">
      <div className="confirmation-card">
        <h2>订单状态</h2>
        {/* 订单基本信息 */}
        <div className="order-info">
          <div className="order-header">
            <p>订单号：</p>
            <h3>{orderDetails.order_number}</h3>
            <p className="order-date">下单时间：{formatDate(orderDetails.created_at)}</p>
            {/* 订单状态显示 */}
            <div className={`order-status ${getStatusClass(orderDetails.status)}`}>
              {getStatusMessage(orderDetails.status)}
            </div>
          </div>
          
          {/* 订单商品列表 */}
          <div className="order-items">
            <h4>订单明细</h4>
            {orderDetails.items.map((item, index) => (
              <div key={index} className="order-item">
                <span className="item-name">{item.name}</span>
                <span className="item-quantity">x{item.quantity}</span>
                <span className="item-price">¥{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            {/* 订单总价 */}
            <div className="order-total">
              <strong>总计：</strong>
              <span>¥{orderDetails.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>
        {/* 返回首页链接 */}
        <Link to="/" className="back-home-btn">
          返回首页
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmation; 