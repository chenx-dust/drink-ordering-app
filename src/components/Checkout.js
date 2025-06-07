import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDrinkContext } from './DrinkContext';
import AddressSelector from './AddressSelector';
import './Checkout.css';

// 提交订单到后端
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
  const { 
    cart,
    getCartTotal,
    deliveryAddress,
    deliveryLocation,
    updateDeliveryAddress,
    setShowCheckout,
    clearCart
  } = useDrinkContext();
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const handleAddressSelect = (address, location) => {
    updateDeliveryAddress(address, location);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 验证必填字段
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
      // 准备订单数据
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

      // 调用API提交订单
      const response = await submitOrder(orderData);

      if (response.success) {
        // 清空购物车
        clearCart();
        // 关闭结账窗口
        setShowCheckout(false);
        // 跳转到订单确认页面
        navigate(`/order/${response.order_number}`);
      }
    } catch (error) {
      console.error('提交订单失败:', error);
      alert('提交订单时出错，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatLocation = (location) => {
    if (!location) return '';
    return `经度: ${parseFloat(location.lng).toFixed(6)}, 纬度: ${parseFloat(location.lat).toFixed(6)}`;
  };
  
  return (
    <div className="checkout-modal-overlay">
      <div className="checkout-modal">
        <div className="checkout-header">
          <h2>完成订单</h2>
          <button className="close-btn" onClick={() => setShowCheckout(false)}>×</button>
        </div>
        
        <div className="checkout-content">
          <form onSubmit={handleSubmit}>
            <div className="checkout-section">
              <h3>配送信息</h3>
              
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
            
            <div className="checkout-section">
              <h3>订单摘要</h3>
              
              <div className="order-summary">
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
                
                <div className="order-total">
                  <span>总计:</span>
                  <span>¥{getCartTotal()}</span>
                </div>
              </div>
            </div>
            
            <div className="checkout-actions">
              <button type="button" className="cancel-btn" onClick={() => setShowCheckout(false)} disabled={isSubmitting}>
                取消
              </button>
              <button type="submit" className="place-order-btn" disabled={isSubmitting}>
                {isSubmitting ? '提交中...' : '确认下单'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 