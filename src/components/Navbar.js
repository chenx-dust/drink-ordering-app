import React, { useState } from "react";
import { useDrinkContext } from "./DrinkContext";
import OrderLookup from "./OrderLookup";
import "./Navbar.css";

const Navbar = () => {
  const { cart, getCartTotal } = useDrinkContext();
  const [showOrderLookup, setShowOrderLookup] = useState(false);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">
          <h1>饮品订购应用</h1>
        </div>
        <div className="navbar-actions">
          <div className="cart-info">
            <span className="cart-total">¥{getCartTotal()}</span>
          </div>
          <button 
            className="lookup-btn"
            onClick={() => setShowOrderLookup(true)}
          >
            查询订单
          </button>
        </div>
      </nav>
      <OrderLookup 
        isOpen={showOrderLookup} 
        onClose={() => setShowOrderLookup(false)} 
      />
    </>
  );
};

export default Navbar;
