/**
 * 分类菜单组件
 * 显示所有饮品分类并处理分类选择
 * 支持高亮显示当前选中的分类
 */

import React from "react";
import { drinks } from "../data/drinks"; // 导入饮品分类数据
import { useDrinkContext } from "./DrinkContext";
import { useEffect } from "react";

const CategoryMenu = () => {
  // 从Context中获取分类相关状态和方法
  const { selectedCategory, setSelectedCategory } = useDrinkContext();

  /**
   * 组件挂载时自动选择第一个分类
   * 确保页面始终有一个选中的分类
   */
  useEffect(() => {
    setSelectedCategory(drinks[0].id);
  }, []);

  return (
    <div className="category-menu">
      <h2>商品分类</h2>
      {/* 分类列表 */}
      <div className="category-list">
        {/* 遍历所有分类并渲染分类项 */}
        {drinks.map((category) => (
          <div
            key={category.id}
            className={`category-item ${
              selectedCategory === category.id ? "active" : "" // 当前选中的分类添加active类
            }`}
            onClick={() => setSelectedCategory(category.id)} // 点击切换选中的分类
          >
            {category.category}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryMenu;
