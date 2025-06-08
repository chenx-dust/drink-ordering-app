/**
 * 购物车组件
 * 显示用户已选择的饮品、数量控制、价格计算和订单提交功能
 */

import React from "react";
import { useDrinkContext } from "./DrinkContext";

const Cart = () => {
  // 从Context中获取购物车相关的状态和方法
  const {
    cart,                    // 购物车数据
    updateCartItemQuantity,  // 更新商品数量
    removeFromCart,          // 移除商品
    clearCart,              // 清空购物车
    getCartTotal,           // 计算总价
    orderComplete,          // 订单完成状态
    setShowCheckout         // 控制结账界面显示
  } = useDrinkContext();

  // 订单完成时显示成功提示
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

  // 购物车为空时显示提示信息
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

  // 购物车有商品时的主要显示界面
  return (
    <div className="cart">
      {/* 购物车头部：标题和清空按钮 */}
      <div className="cart-header">
        <h2>您的购物车</h2>
        <button className="clear-cart-btn" onClick={clearCart}>
          Clear Cart
        </button>
      </div>

      {/* 购物车商品列表 */}
      <div className="cart-items">
        {cart.map((item) => (
          <div key={item.id} className="cart-item">
            {/* 商品信息区域：名称、规格和选项 */}
            <div className="cart-item-info">
              <h3>{item.drink.name}</h3>
              <p>{item.size.name}</p>

              {/* 商品选项标签（如果有） */}
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

            {/* 商品操作区域：数量控制、价格显示和删除按钮 */}
            <div className="cart-item-actions">
              {/* 数量加减控制 */}
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

              {/* 商品总价显示 */}
              <div className="cart-item-price">
                ¥{(item.totalPrice * item.quantity).toFixed(2)}
              </div>

              {/* 删除按钮 */}
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

      {/* 购物车底部：总价和结账按钮 */}
      <div className="cart-footer">
        <div className="cart-total">
          <span>总计：</span>
          <span>¥{getCartTotal()}</span>
        </div>

        <button className="checkout-btn" onClick={() => setShowCheckout(true)}>
          提交订单
        </button>
      </div>
    </div>
  );
};

export default Cart;
