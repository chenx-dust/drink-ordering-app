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

function MainContent() {
  const { showCheckout } = useDrinkContext();

  return (
    <>
      <Navbar />
      <div className="main-content">
        <div className="sidebar">
          <CategoryMenu />
          <Cart />
        </div>
        <DrinkList />
      </div>
      {showCheckout && <Checkout />}
    </>
  );
}

function App() {
  return (
    <Router>
      <DrinkProvider>
        <div className="App">
          <Routes>
            <Route path="/order/:orderNumber" element={<OrderConfirmation />} />
            <Route path="/" element={<MainContent />} />
            {/* 捕获所有未匹配的路由 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </DrinkProvider>
    </Router>
  );
}

export default App;
