/**
 * 饮品列表组件
 * 根据选中的分类显示对应的饮品列表
 * 使用网格布局展示饮品项目
 */

import React from "react";
import { drinks } from "../data/drinks"; // 导入饮品数据
import { useDrinkContext } from "./DrinkContext";
import DrinkItem from "./DrinkItem"; // 单个饮品项目组件

const DrinkList = () => {
  // 从Context中获取当前选中的分类
  const { selectedCategory } = useDrinkContext();

  // 根据选中的分类ID查找对应的分类数据
  const category = drinks.find((cat) => cat.id === selectedCategory);

  // 如果没有选中分类，显示提示信息
  if (!category) {
    return <div className="empty-state">未选择分类</div>;
  }

  // 渲染饮品列表
  return (
    <div className="drink-list">
      {/* 显示分类名称 */}
      <h2>{category.category}</h2>
      
      {/* 使用网格布局展示饮品列表 */}
      <div className="drink-grid">
        {/* 遍历分类下的所有饮品并渲染DrinkItem组件 */}
        {category.items.map((drink) => (
          <DrinkItem key={drink.id} drink={drink} />
        ))}
      </div>
    </div>
  );
};

export default DrinkList;
