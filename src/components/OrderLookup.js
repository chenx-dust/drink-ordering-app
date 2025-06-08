/**
 * 订单查询组件
 * 提供订单查询功能的模态弹窗
 * 允许用户输入订单号并跳转到对应的订单详情页
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrderLookup.css';

/**
 * OrderLookup组件
 * @param {boolean} isOpen - 控制弹窗显示状态
 * @param {Function} onClose - 关闭弹窗的回调函数
 */
const OrderLookup = ({ isOpen, onClose }) => {
  // 状态管理
  const [orderNumber, setOrderNumber] = useState(''); // 订单号输入
  const [error, setError] = useState(''); // 错误信息
  const navigate = useNavigate(); // 路由导航

  /**
   * 处理订单查询提交
   * 验证输入并调用API查询订单信息
   * @param {Event} e - 表单提交事件
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    // 验证订单号是否为空
    if (!orderNumber.trim()) {
      setError('请输入订单号');
      return;
    }

    try {
      // 调用API查询订单
      const response = await fetch(`/api/orders/${orderNumber.trim()}`);
      if (response.ok) {
        // 查询成功，关闭弹窗并跳转到订单详情页
        onClose();
        navigate(`/order/${orderNumber.trim()}`);
      } else {
        // 未找到订单
        setError('未找到该订单');
      }
    } catch (err) {
      // API调用失败
      setError('查询订单时出错');
    }
  };

  // 如果弹窗未打开，不渲染任何内容
  if (!isOpen) return null;

  return (
    <div className="order-lookup-overlay">
      <div className="order-lookup-modal">
        {/* 关闭按钮 */}
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>订单查询</h2>

        {/* 查询表单 */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="orderNumber">订单号</label>
            <input
              type="text"
              id="orderNumber"
              value={orderNumber}
              onChange={(e) => {
                setOrderNumber(e.target.value);
                setError(''); // 输入时清除错误信息
              }}
              placeholder="请输入订单号"
              autoFocus // 自动获取焦点
            />
            {/* 错误信息显示 */}
            {error && <div className="error-message">{error}</div>}
          </div>

          {/* 表单按钮 */}
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