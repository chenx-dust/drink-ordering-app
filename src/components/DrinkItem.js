/**
 * 单个饮品项目组件
 * 显示饮品信息并处理用户的定制选择
 * 包含弹窗式的饮品定制界面
 */

import React, { useState } from "react";
import { sizes, options } from "../data/drinks"; // 导入饮品规格和配料选项数据
import { useDrinkContext } from "./DrinkContext";

/**
 * DrinkItem组件 - 展示单个饮品信息并处理用户交互
 * @param {Object} drink - 饮品信息对象
 */
const DrinkItem = ({ drink }) => {
  // 状态管理
  const [showModal, setShowModal] = useState(false); // 控制定制弹窗的显示
  const [selectedSize, setSelectedSize] = useState(sizes[0]); // 选中的规格
  const [selectedOptions, setSelectedOptions] = useState([]); // 选中的配料选项
  const { addToCart } = useDrinkContext(); // 从Context获取添加到购物车方法

  /**
   * 切换配料选项的选中状态
   * @param {Object} option - 配料选项对象
   */
  const toggleOption = (option) => {
    if (selectedOptions.find((opt) => opt.id === option.id)) {
      // 如果已选中则移除
      setSelectedOptions(selectedOptions.filter((opt) => opt.id !== option.id));
    } else {
      // 如果未选中则添加
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  /**
   * 处理添加到购物车
   * 添加商品后重置选择并关闭弹窗
   */
  const handleAddToCart = () => {
    addToCart(drink, selectedSize, selectedOptions);
    setShowModal(false);
    // 重置选择状态
    setSelectedSize(sizes[0]);
    setSelectedOptions([]);
  };

  /**
   * 计算当前选择的总价
   * @returns {string} 格式化的价格字符串
   */
  const calculatePrice = () => {
    let total = drink.basePrice + selectedSize.priceModifier;
    selectedOptions.forEach((option) => {
      total += option.price;
    });
    return total.toFixed(2);
  };

  return (
    <>
      {/* 饮品卡片 - 点击显示定制弹窗 */}
      <div className="drink-item" onClick={() => setShowModal(true)}>
        <div className="drink-image">
          <img src={drink.image} alt={drink.name} />
        </div>
        <div className="drink-info">
          <h3>{drink.name}</h3>
          <p>{drink.description}</p>
          <div className="drink-price">¥{drink.basePrice.toFixed(2)}</div>
        </div>
      </div>

      {/* 饮品定制弹窗 */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            {/* 弹窗头部 */}
            <div className="modal-header">
              <h2>Customize your {drink.name}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            {/* 弹窗主体内容 */}
            <div className="modal-body">
              {/* 饮品预览信息 */}
              <div className="drink-preview">
                <img src={drink.image} alt={drink.name} />
                <h3>{drink.name}</h3>
                <p>{drink.description}</p>
              </div>

              {/* 规格选择区域 */}
              <div className="customization-section">
                <h4>Size</h4>
                <div className="size-options">
                  {sizes.map((size) => (
                    <div
                      key={size.id}
                      className={`size-option ${
                        selectedSize.id === size.id ? "selected" : ""
                      }`}
                      onClick={() => setSelectedSize(size)}
                    >
                      <span>{size.name}</span>
                      <span>+¥{size.priceModifier.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 配料选项区域 */}
              <div className="customization-section">
                <h4>Options</h4>
                <div className="option-list">
                  {options.map((option) => (
                    <div
                      key={option.id}
                      className={`option-item ${
                        selectedOptions.find((opt) => opt.id === option.id)
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => toggleOption(option)}
                    >
                      <span>{option.name}</span>
                      <span>+¥{option.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 弹窗底部 - 显示总价和添加到购物车按钮 */}
            <div className="modal-footer">
              <div className="final-price">总计: ¥{calculatePrice()}</div>
              <button className="add-to-cart-btn" onClick={handleAddToCart}>
                加入购物车
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DrinkItem;
