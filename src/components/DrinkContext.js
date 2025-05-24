import React, { createContext, useState, useContext } from 'react';

const DrinkContext = createContext();

export const useDrinkContext = () => useContext(DrinkContext);

export const DrinkProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(1);
  const [orderComplete, setOrderComplete] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  
  // Add item to cart
  const addToCart = (drink, size, selectedOptions = []) => {
    const cartItem = {
      id: Date.now(), // unique ID for the cart item
      drink,
      size,
      options: selectedOptions,
      quantity: 1,
      totalPrice: calculatePrice(drink, size, selectedOptions)
    };
    
    setCart(prevCart => [...prevCart, cartItem]);
  };
  
  // Calculate price based on item, size and options
  const calculatePrice = (drink, size, options) => {
    let basePrice = drink.basePrice;
    
    // Add size price modifier
    basePrice += size.priceModifier;
    
    // Add options price
    const optionsPrice = options.reduce((total, option) => total + option.price, 0);
    
    return basePrice + optionsPrice;
  };
  
  // Update quantity of a cart item
  const updateCartItemQuantity = (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      // Remove item if quantity is 0 or negative
      removeFromCart(cartItemId);
      return;
    }
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === cartItemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };
  
  // Remove item from cart
  const removeFromCart = (cartItemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== cartItemId));
  };
  
  // Clear cart
  const clearCart = () => {
    setCart([]);
  };
  
  // Calculate cart total
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.totalPrice * item.quantity), 0).toFixed(2);
  };

  // Set delivery address
  const updateDeliveryAddress = (address) => {
    setDeliveryAddress(address);
  };
  
  // Start checkout process
  const startCheckout = () => {
    if (cart.length > 0) {
      setShowCheckout(true);
    }
  };
  
  // Complete the order
  const completeOrder = () => {
    if (!deliveryAddress) {
      alert('请选择配送地址');
      return;
    }
    
    // In a real app, we would send the order to a backend server here
    // including the delivery address information
    const orderData = {
      items: cart,
      total: getCartTotal(),
      deliveryAddress: deliveryAddress,
      orderTime: new Date().toISOString()
    };
    
    console.log('Order placed:', orderData);
    
    setOrderComplete(true);
    clearCart();
    setShowCheckout(false);
    
    // Reset order status after 5 seconds
    setTimeout(() => {
      setOrderComplete(false);
    }, 5000);
  };
  
  return (
    <DrinkContext.Provider
      value={{
        cart,
        selectedCategory,
        setSelectedCategory,
        addToCart,
        updateCartItemQuantity,
        removeFromCart,
        clearCart,
        getCartTotal,
        completeOrder,
        orderComplete,
        deliveryAddress,
        updateDeliveryAddress,
        showCheckout,
        setShowCheckout,
        startCheckout
      }}
    >
      {children}
    </DrinkContext.Provider>
  );
};

export default DrinkContext; 