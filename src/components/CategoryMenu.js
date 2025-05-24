import React from "react";
import { drinks } from "../data/drinks";
import { useDrinkContext } from "./DrinkContext";

const CategoryMenu = () => {
  const { selectedCategory, setSelectedCategory } = useDrinkContext();

  return (
    <div className="category-menu">
      <h2>商品分类</h2>
      <div className="category-list">
        {drinks.map((category) => (
          <div
            key={category.id}
            className={`category-item ${
              selectedCategory === category.id ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.category}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryMenu;
