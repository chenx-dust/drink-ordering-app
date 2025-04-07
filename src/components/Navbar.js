import React from 'react';
import { useDrinkContext } from './DrinkContext';

const Navbar = () => {
  const { cart, getCartTotal } = useDrinkContext();
  
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>Drink Ordering App</h1>
      </div>
      <div className="navbar-cart">
        <div className="cart-info">
          <span className="cart-count">{cart.length} items</span>
          <span className="cart-total">${getCartTotal()}</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 