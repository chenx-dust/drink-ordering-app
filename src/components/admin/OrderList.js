import React, { useState, useEffect } from 'react';
import './OrderList.css';

const OrderList = ({ filterStatus, onOrderSelect, selectedOrderId, refreshTrigger }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [filterStatus, refreshTrigger]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = filterStatus === 'all' 
        ? '/api/orders'
        : `/api/orders?status=${filterStatus}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('获取订单列表失败');
      }

      const data = await response.json();
      setOrders(data.orders);
      setError(null);
    } catch (error) {
      console.error('获取订单列表失败:', error);
      setError('获取订单列表时出错');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchOrders();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusClass = (status) => {
    const statusMap = {
      pending: 'status-pending',
      preparing: 'status-preparing',
      delivering: 'status-delivering',
      completed: 'status-completed',
      cancelled: 'status-cancelled',
    };
    return statusMap[status] || '';
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: '待处理',
      preparing: '制作中',
      delivering: '配送中',
      completed: '已完成',
      cancelled: '已取消',
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return <div className="order-list-loading">加载中...</div>;
  }

  if (error) {
    return <div className="order-list-error">{error}</div>;
  }

  return (
    <div className="order-list">
      <div className="order-list-header">
        <h2>订单列表</h2>
        <button 
          className={`refresh-button ${isRefreshing ? 'refreshing' : ''}`}
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? '刷新中...' : '刷新'}
        </button>
      </div>
      {orders.length === 0 ? (
        <div className="no-orders">暂无订单</div>
      ) : (
        <div className="orders-container">
          {orders.map(order => (
            <div 
              key={order.id}
              className={`order-item ${selectedOrderId === order.id ? 'selected' : ''}`}
              onClick={() => onOrderSelect(order)}
            >
              <div className="order-header">
                <span className="order-number">#{order.order_number}</span>
                <span className={`order-status ${getStatusClass(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>
              
              <div className="order-info">
                <div className="order-customer">
                  <strong>{order.customer_name}</strong>
                  <span>{order.phone_number}</span>
                </div>
                <div className="order-time">
                  {formatDate(order.created_at)}
                </div>
              </div>
              
              <div className="order-summary">
                <span className="order-items-count">
                  {order.items.length} 件商品
                </span>
                <span className="order-total">
                  ¥{order.total_amount.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderList; 