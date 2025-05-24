import React, { useState } from 'react';
import { useDrinkContext } from './DrinkContext';
import AddressSelector from './AddressSelector';

const Checkout = () => {
  const { 
    cart, 
    getCartTotal, 
    deliveryAddress, 
    updateDeliveryAddress, 
    completeOrder,
    setShowCheckout
  } = useDrinkContext();
  
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notes, setNotes] = useState('');
  
  const handleAddressSelect = (address) => {
    updateDeliveryAddress(address);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!deliveryAddress) {
      alert('请选择配送地址');
      return;
    }
    
    if (!customerName) {
      alert('请输入您的姓名');
      return;
    }
    
    if (!phoneNumber) {
      alert('请输入您的电话号码');
      return;
    }
    
    completeOrder();
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
                <AddressSelector onAddressSelect={handleAddressSelect} />
                {deliveryAddress && (
                  <div className="selected-address">
                    <div>{deliveryAddress.address}</div>
                    {deliveryAddress.location && (
                      <div className="address-coordinates">
                        {formatLocation(deliveryAddress.location)}
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
                        ${(item.totalPrice * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="order-total">
                  <span>总计:</span>
                  <span>${getCartTotal()}</span>
                </div>
              </div>
            </div>
            
            <div className="checkout-actions">
              <button type="button" className="cancel-btn" onClick={() => setShowCheckout(false)}>
                取消
              </button>
              <button type="submit" className="place-order-btn">
                确认下单
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 