/**
 * 饮品订购应用的全局状态管理文件
 * 使用React Context API实现状态管理
 * 包含购物车、饮品列表、分类、订单等状态的管理
 */

import React, { createContext, useState, useContext } from 'react';

// 创建Context实例
const DrinkContext = createContext();

// 自定义Hook，用于在组件中方便地访问Context
export const useDrinkContext = () => useContext(DrinkContext);

/**
 * DrinkProvider组件 - 全局状态提供者
 * 管理应用中所有的状态和业务逻辑
 */
export const DrinkProvider = ({ children }) => {
  // 状态定义
  const [drinks, setDrinks] = useState([]); // 饮品列表
  const [categories, setCategories] = useState([]); // 饮品分类
  const [selectedCategory, setSelectedCategory] = useState(null); // 当前选中的分类
  const [cart, setCart] = useState([]); // 购物车
  const [showCheckout, setShowCheckout] = useState(false); // 是否显示结账界面
  const [deliveryAddress, setDeliveryAddress] = useState(''); // 配送地址
  const [deliveryLocation, setDeliveryLocation] = useState(null); // 配送位置坐标
  const [orderComplete, setOrderComplete] = useState(false); // 订单完成状态
  
  /**
   * 添加商品到购物车
   * @param {Object} drink - 饮品信息
   * @param {Object} size - 规格信息
   * @param {Array} selectedOptions - 选择的配料选项
   */
  const addToCart = (drink, size, selectedOptions = []) => {
    const cartItem = {
      id: Date.now(), // 购物车项的唯一标识
      drink,
      size,
      options: selectedOptions,
      quantity: 1,
      totalPrice: calculatePrice(drink, size, selectedOptions)
    };
    
    setCart(prevCart => [...prevCart, cartItem]);
  };
  
  /**
   * 计算商品价格
   * @param {Object} drink - 饮品信息
   * @param {Object} size - 规格信息
   * @param {Array} options - 选择的配料选项
   * @returns {number} - 计算后的总价
   */
  const calculatePrice = (drink, size, options) => {
    let basePrice = drink.basePrice;
    basePrice += size.priceModifier; // 加上规格价格
    const optionsPrice = options.reduce((total, option) => total + option.price, 0); // 加上配料价格
    return basePrice + optionsPrice;
  };
  
  /**
   * 更新购物车中商品的数量
   * @param {number} cartItemId - 购物车项ID
   * @param {number} newQuantity - 新的数量
   */
  const updateCartItemQuantity = (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === cartItemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };
  
  /**
   * 从购物车中移除商品
   * @param {number} cartItemId - 购物车项ID
   */
  const removeFromCart = (cartItemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== cartItemId));
  };
  
  /**
   * 清空购物车
   */
  const clearCart = () => {
    setCart([]);
  };
  
  /**
   * 计算购物车总价
   * @returns {string} - 格式化后的总价（保留两位小数）
   */
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.totalPrice * item.quantity), 0).toFixed(2);
  };

  /**
   * 更新配送地址信息
   * @param {string} address - 配送地址
   * @param {Object} location - 地址坐标
   */
  const updateDeliveryAddress = (address, location) => {
    setDeliveryAddress(address);
    setDeliveryLocation(location);
  };
  
  /**
   * 开始结账流程
   * 只有购物车非空时才能开始结账
   */
  const startCheckout = () => {
    if (cart.length > 0) {
      setShowCheckout(true);
    }
  };
  
  /**
   * 完成订单
   * 处理订单提交、清空购物车并重置相关状态
   */
  const completeOrder = () => {
    if (!deliveryAddress) {
      alert('请选择配送地址');
      return;
    }
    
    // 准备订单数据
    const orderData = {
      items: cart,
      total: getCartTotal(),
      deliveryAddress: deliveryAddress,
      orderTime: new Date().toISOString()
    };
    
    console.log('Order placed:', orderData);
    
    // 重置相关状态
    setOrderComplete(true);
    clearCart();
    setShowCheckout(false);
    
    // 5秒后重置订单完成状态
    setTimeout(() => {
      setOrderComplete(false);
    }, 5000);
  };
  
  // 提供Context值
  return (
    <DrinkContext.Provider
      value={{
        drinks,
        categories,
        selectedCategory,
        cart,
        showCheckout,
        deliveryAddress,
        deliveryLocation,
        setSelectedCategory,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        getCartTotal,
        setShowCheckout,
        updateDeliveryAddress,
        completeOrder,
        orderComplete
      }}
    >
      {children}
    </DrinkContext.Provider>
  );
};

export default DrinkContext; 