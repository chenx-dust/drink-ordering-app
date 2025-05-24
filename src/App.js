import React from 'react';
import './App.css';
import { DrinkProvider, useDrinkContext } from './components/DrinkContext';
import Navbar from './components/Navbar';
import CategoryMenu from './components/CategoryMenu';
import DrinkList from './components/DrinkList';
import Cart from './components/Cart';
import Checkout from './components/Checkout';

function App() {
  return (
    <DrinkProvider>
      <div className="App">
        <Navbar />
        <div className="main-content">
          <div className="sidebar">
            <CategoryMenu />
            <Cart />
          </div>
          <div className="content">
            <DrinkList />
          </div>
        </div>
        <AppOverlays />
      </div>
    </DrinkProvider>
  );
}

// Separate component for modals/overlays to keep the main App component cleaner
const AppOverlays = () => {
  const { showCheckout } = useDrinkContext();
  
  return (
    <>
      {showCheckout && <Checkout />}
    </>
  );
};

export default App;
