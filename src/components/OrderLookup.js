import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrderLookup.css';

const OrderLookup = ({ isOpen, onClose }) => {
  const [orderNumber, setOrderNumber] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      setError('请输入订单号');
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderNumber.trim()}`);
      if (response.ok) {
        onClose();
        navigate(`/order/${orderNumber.trim()}`);
      } else {
        setError('未找到该订单');
      }
    } catch (err) {
      setError('查询订单时出错');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="order-lookup-overlay">
      <div className="order-lookup-modal">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>订单查询</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="orderNumber">订单号</label>
            <input
              type="text"
              id="orderNumber"
              value={orderNumber}
              onChange={(e) => {
                setOrderNumber(e.target.value);
                setError('');
              }}
              placeholder="请输入订单号"
              autoFocus
            />
            {error && <div className="error-message">{error}</div>}
          </div>
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="submit-btn">
              查询
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderLookup; 