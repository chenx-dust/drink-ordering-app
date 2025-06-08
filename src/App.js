/**
 * 饮品订购应用的主入口文件
 * 负责应用的整体路由结构和布局管理
 */

import React from 'react';
import './App.css';
import { DrinkProvider, useDrinkContext } from './components/DrinkContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import CategoryMenu from './components/CategoryMenu';
import DrinkList from './components/DrinkList';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import OrderConfirmation from './components/OrderConfirmation';
import NotFound from './components/NotFound';

/**
 * MainContent组件 - 应用的主要内容区域
 * 包含导航栏、侧边栏（分类菜单和购物车）以及饮品列表
 * 当showCheckout为true时显示结账界面
 */
function MainContent() {
  const { showCheckout } = useDrinkContext();

  return (
    <>
      <Navbar />
      <div className="main-content">
        <div className="sidebar">
          <CategoryMenu /> {/* 饮品分类菜单 */}
          <Cart /> {/* 购物车组件 */}
        </div>
        <DrinkList /> {/* 饮品列表展示区域 */}
      </div>
      {showCheckout && <Checkout />} {/* 条件渲染结账界面 */}
    </>
  );
}

/**
 * App组件 - 应用的根组件
 * 设置路由系统和全局状态管理
 * 包含三个主要路由：
 * 1. 主页面 ('/')
 * 2. 订单确认页 ('/order/:orderNumber')
 * 3. 404页面 ('*')
 */
function App() {
  return (
    <Router>
      <DrinkProvider> {/* 全局饮品状态管理提供者 */}
        <div className="App">
          <Routes>
            <Route path="/order/:orderNumber" element={<OrderConfirmation />} />
            <Route path="/" element={<MainContent />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </DrinkProvider>
    </Router>
  );
}

export default App;
