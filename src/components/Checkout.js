/**
 * 结账组件
 * 处理订单提交流程，包括收集用户信息、地址选择和订单确认
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDrinkContext } from './DrinkContext';
import AddressSelector from './AddressSelector';
import './Checkout.css';

/**
 * 提交订单到后端服务器
 * @param {Object} orderData - 订单数据
 * @returns {Promise} 包含订单处理结果的Promise
 * @throws {Error} 当订单提交失败时抛出错误
 */
const submitOrder = async (orderData) => {
  const response = await fetch('/api/orders/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData)
  });

  if (!response.ok) {
    throw new Error('提交订单失败');
  }

  let data = await response.json();
  if (!data.success) {
    throw new Error(data.message || '提交订单失败');
  }
  return data;
};

const Checkout = () => {
  // 从Context中获取购物车相关状态和方法
  const { 
    cart,
    getCartTotal,
    deliveryAddress,
    deliveryLocation,
    updateDeliveryAddress,
    setShowCheckout,
    clearCart
  } = useDrinkContext();

  // 用户信息状态管理
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  /**
   * 处理地址选择
   * @param {string} address - 选择的地址
   * @param {Object} location - 地址的经纬度信息
   */
  const handleAddressSelect = (address, location) => {
    updateDeliveryAddress(address, location);
  };
  
  /**
   * 处理订单提交
   * 验证表单数据，准备订单信息并提交到服务器
   * @param {Event} e - 表单提交事件
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 表单验证
    if (!customerName.trim()) {
      alert('请输入姓名');
      return;
    }
    if (!phoneNumber.trim()) {
      alert('请输入电话号码');
      return;
    }
    if (!deliveryAddress) {
      alert('请选择配送地址');
      return;
    }
    if (!deliveryLocation || !deliveryLocation.lat || !deliveryLocation.lng) {
      alert('请选择有效的配送地址');
      return;
    }

    setIsSubmitting(true);

    try {
      // 构建订单数据
      const orderData = {
        items: cart.map(item => ({
          name: `${item.drink.name} (${item.size.name})${item.options.length ? ` - ${item.options.map(opt => opt.name).join(', ')}` : ''}`,
          quantity: item.quantity,
          price: item.totalPrice
        })),
        total_amount: cart.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0),
        customer_name: customerName,
        phone_number: phoneNumber,
        delivery_address: deliveryAddress,
        location: {
          lat: deliveryLocation.lat,
          lng: deliveryLocation.lng
        },
        notes: notes || undefined
      };

      // 提交订单并处理响应
      const response = await submitOrder(orderData);

      if (response.success) {
        clearCart();
        setShowCheckout(false);
        navigate(`/order/${response.order_number}`);
      }
    } catch (error) {
      console.error('提交订单失败:', error);
      alert('提交订单时出错，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  /**
   * 格式化地址坐标显示
   * @param {Object} location - 包含经纬度的位置对象
   * @returns {string} 格式化后的位置字符串
   */
  const formatLocation = (location) => {
    if (!location) return '';
    return `经度: ${parseFloat(location.lng).toFixed(6)}, 纬度: ${parseFloat(location.lat).toFixed(6)}`;
  };
  
  return (
    <div className="checkout-modal-overlay">
      <div className="checkout-modal">
        {/* 结账窗口头部 */}
        <div className="checkout-header">
          <h2>完成订单</h2>
          <button className="close-btn" onClick={() => setShowCheckout(false)}>×</button>
        </div>
        
        <div className="checkout-content">
          <form onSubmit={handleSubmit}>
            {/* 配送信息部分 */}
            <div className="checkout-section">
              <h3>配送信息</h3>
              
              {/* 地址选择器 */}
              <div className="form-group">
                <label>配送地址</label>
                <AddressSelector onSelect={handleAddressSelect} />
                {deliveryAddress && (
                  <div className="selected-address">
                    <div>{deliveryAddress}</div>
                    {deliveryLocation && (
                      <div className="address-coordinates">
                        {formatLocation(deliveryLocation)}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* 用户信息输入 */}
              <div className="form-group">
                <label htmlFor="name">姓名</label>
                <input
                  type="text"
                  id="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="收货人姓名"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">电话</label>
                <input
                  type="tel"
                  id="phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="联系电话"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="notes">备注</label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="特殊要求或备注信息"
                />
              </div>
            </div>
            
            {/* 订单摘要部分 */}
            <div className="checkout-section">
              <h3>订单摘要</h3>
              
              <div className="order-summary">
                {/* 订单商品列表 */}
                <div className="summary-items">
                  {cart.map(item => (
                    <div key={item.id} className="summary-item">
                      <div className="summary-item-name">
                        {item.drink.name} ({item.size.name}) × {item.quantity}
                        {item.options.length > 0 && (
                          <div className="summary-item-options">
                            {item.options.map(option => option.name).join(', ')}
                          </div>
                        )}
                      </div>
                      <div className="summary-item-price">
                        ¥{(item.totalPrice * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* 订单总价 */}
                <div className="order-total">
                  <span>总计:</span>
                  <span>¥{getCartTotal()}</span>
                </div>
              </div>
              
              {/* 提交按钮 */}
              <button
                type="submit"
                className="submit-order-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? '提交中...' : '提交订单'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 