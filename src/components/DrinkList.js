import React from "react";
import { drinks } from "../data/drinks";
import { useDrinkContext } from "./DrinkContext";
import DrinkItem from "./DrinkItem";

const DrinkList = () => {
  const { selectedCategory } = useDrinkContext();

  // Find the selected category
  const category = drinks.find((cat) => cat.id === selectedCategory);

  if (!category) {
    return <div className="empty-state">未选择分类</div>;
  }

  return (
    <div className="drink-list">
      <h2>{category.category}</h2>
      <div className="drink-grid">
        {category.items.map((drink) => (
          <DrinkItem key={drink.id} drink={drink} />
        ))}
      </div>
    </div>
  );
};

export default DrinkList;
