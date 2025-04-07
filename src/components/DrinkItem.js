import React, { useState } from 'react';
import { sizes, options } from '../data/drinks';
import { useDrinkContext } from './DrinkContext';

const DrinkItem = ({ drink }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const { addToCart } = useDrinkContext();
  
  const toggleOption = (option) => {
    if (selectedOptions.find(opt => opt.id === option.id)) {
      setSelectedOptions(selectedOptions.filter(opt => opt.id !== option.id));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };
  
  const handleAddToCart = () => {
    addToCart(drink, selectedSize, selectedOptions);
    setShowModal(false);
    // Reset selections
    setSelectedSize(sizes[0]);
    setSelectedOptions([]);
  };
  
  const calculatePrice = () => {
    let total = drink.basePrice + selectedSize.priceModifier;
    selectedOptions.forEach(option => {
      total += option.price;
    });
    return total.toFixed(2);
  };
  
  return (
    <>
      <div className="drink-item" onClick={() => setShowModal(true)}>
        <div className="drink-image">
          <img src={drink.image} alt={drink.name} />
        </div>
        <div className="drink-info">
          <h3>{drink.name}</h3>
          <p>{drink.description}</p>
          <div className="drink-price">${drink.basePrice.toFixed(2)}</div>
        </div>
      </div>
      
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Customize your {drink.name}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="drink-preview">
                <img src={drink.image} alt={drink.name} />
                <h3>{drink.name}</h3>
                <p>{drink.description}</p>
              </div>
              
              <div className="customization-section">
                <h4>Size</h4>
                <div className="size-options">
                  {sizes.map(size => (
                    <div 
                      key={size.id} 
                      className={`size-option ${selectedSize.id === size.id ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      <span>{size.name}</span>
                      <span>+${size.priceModifier.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="customization-section">
                <h4>Options</h4>
                <div className="option-list">
                  {options.map(option => (
                    <div 
                      key={option.id} 
                      className={`option-item ${selectedOptions.find(opt => opt.id === option.id) ? 'selected' : ''}`}
                      onClick={() => toggleOption(option)}
                    >
                      <span>{option.name}</span>
                      <span>+${option.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <div className="final-price">Total: ${calculatePrice()}</div>
              <button className="add-to-cart-btn" onClick={handleAddToCart}>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DrinkItem; 