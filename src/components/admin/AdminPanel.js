import React, { useState } from 'react';
import OrderList from './OrderList';
import OrderDetail from './OrderDetail';
import './AdminPanel.css';

const AdminPanel = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
  };

  const handleStatusChange = (status) => {
    setFilterStatus(status);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('更新订单状态失败');
      }

      // 触发列表刷新
      setRefreshTrigger(prev => prev + 1);
      // 清除选中的订单
      setSelectedOrder(null);
    } catch (error) {
      console.error('更新订单状态失败:', error);
      alert('更新订单状态时出错');
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>订单管理系统</h1>
        <div className="status-filter">
          <label>订单状态：</label>
          <select 
            value={filterStatus} 
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="all">全部</option>
            <option value="pending">待处理</option>
            <option value="preparing">制作中</option>
            <option value="delivering">配送中</option>
            <option value="completed">已完成</option>
            <option value="cancelled">已取消</option>
          </select>
        </div>
      </div>
      
      <div className="admin-content">
        <OrderList 
          filterStatus={filterStatus}
          onOrderSelect={handleOrderSelect}
          selectedOrderId={selectedOrder?.id}
          refreshTrigger={refreshTrigger}
        />
        {selectedOrder && (
          <OrderDetail 
            order={selectedOrder}
            onStatusUpdate={handleStatusUpdate}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </div>
    </div>
  );
};

export default AdminPanel; 