import React from "react";
import { useDrinkContext } from "./DrinkContext";

const Cart = () => {
  const {
    cart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    orderComplete,
    startCheckout
  } = useDrinkContext();

  if (orderComplete) {
    return (
      <div className="cart">
        <h2>订单已完成！</h2>
        <div className="order-success">
          <p>您的订单已成功提交</p>
          <p>感谢您的购买！</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="cart">
        <h2>您的购物车</h2>
        <div className="empty-cart">
          <p>您的购物车是空的</p>
          <p>添加饮品开始选购吧！</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart">
      <div className="cart-header">
        <h2>您的购物车</h2>
        <button className="clear-cart-btn" onClick={clearCart}>
          Clear Cart
        </button>
      </div>

      <div className="cart-items">
        {cart.map((item) => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-info">
              <h3>{item.drink.name}</h3>
              <p>{item.size.name}</p>

              {item.options.length > 0 && (
                <div className="cart-item-options">
                  {item.options.map((option) => (
                    <span key={option.id} className="option-tag">
                      {option.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="cart-item-actions">
              <div className="quantity-controls">
                <button
                  className="quantity-btn"
                  onClick={() =>
                    updateCartItemQuantity(item.id, item.quantity - 1)
                  }
                >
                  -
                </button>
                <span className="quantity">{item.quantity}</span>
                <button
                  className="quantity-btn"
                  onClick={() =>
                    updateCartItemQuantity(item.id, item.quantity + 1)
                  }
                >
                  +
                </button>
              </div>

              <div className="cart-item-price">
                ¥{(item.totalPrice * item.quantity).toFixed(2)}
              </div>

              <button
                className="remove-btn"
                onClick={() => removeFromCart(item.id)}
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-footer">
        <div className="cart-total">
          <span>总计：</span>
          <span>¥{getCartTotal()}</span>
        </div>

        <button className="checkout-btn" onClick={startCheckout}>
          提交订单
        </button>
      </div>
    </div>
  );
};

export default Cart;
