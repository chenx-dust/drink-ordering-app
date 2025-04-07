import React from 'react';
import './App.css';
import { DrinkProvider } from './components/DrinkContext';
import Navbar from './components/Navbar';
import CategoryMenu from './components/CategoryMenu';
import DrinkList from './components/DrinkList';
import Cart from './components/Cart';

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
      </div>
    </DrinkProvider>
  );
}

export default App;
