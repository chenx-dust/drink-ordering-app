/**
 * 导航栏组件
 * 显示应用标题、购物车总价和订单查询功能
 * 固定在页面顶部的主导航区域
 */

import React, { useState } from "react";
import { useDrinkContext } from "./DrinkContext";
import OrderLookup from "./OrderLookup"; // 订单查询组件
import "./Navbar.css";

const Navbar = () => {
  // 从Context中获取购物车相关状态和方法
  const { cart, getCartTotal } = useDrinkContext();
  
  // 控制订单查询弹窗的显示状态
  const [showOrderLookup, setShowOrderLookup] = useState(false);

  return (
    <>
      {/* 导航栏主体 */}
      <nav className="navbar">
        {/* 品牌区域 - 显示应用名称 */}
        <div className="navbar-brand">
          <h1>饮品订购应用</h1>
        </div>

        {/* 导航栏操作区域 */}
        <div className="navbar-actions">
          {/* 购物车信息显示 */}
          <div className="cart-info">
            <span className="cart-total">¥{getCartTotal()}</span>
          </div>

          {/* 订单查询按钮 */}
          <button 
            className="lookup-btn"
            onClick={() => setShowOrderLookup(true)}
          >
            查询订单
          </button>
        </div>
      </nav>

      {/* 订单查询弹窗组件 */}
      <OrderLookup 
        isOpen={showOrderLookup} 
        onClose={() => setShowOrderLookup(false)} 
      />
    </>
  );
};

export default Navbar;
