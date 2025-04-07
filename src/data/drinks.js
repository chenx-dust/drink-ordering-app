const drinks = [
  {
    id: 1,
    category: "Coffee",
    items: [
      {
        id: 101,
        name: "Espresso",
        description: "Strong coffee brewed by forcing hot water through finely-ground coffee beans",
        basePrice: 2.50,
        image: "https://images.unsplash.com/photo-1520516472218-ed48f8f1d9df?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"
      },
      {
        id: 102,
        name: "Cappuccino",
        description: "Espresso with steamed milk foam",
        basePrice: 3.50,
        image: "https://images.unsplash.com/photo-1534778101976-62847782c213?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"
      },
      {
        id: 103,
        name: "Latte",
        description: "Espresso with steamed milk",
        basePrice: 3.75,
        image: "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"
      }
    ]
  },
  {
    id: 2,
    category: "Tea",
    items: [
      {
        id: 201,
        name: "Green Tea",
        description: "Light and refreshing tea with antioxidants",
        basePrice: 2.25,
        image: "https://images.unsplash.com/photo-1556682851-71e037122346?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"
      },
      {
        id: 202,
        name: "Earl Grey",
        description: "Black tea flavored with bergamot oil",
        basePrice: 2.25,
        image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"
      },
      {
        id: 203,
        name: "Chai Latte",
        description: "Spiced tea mixed with steamed milk",
        basePrice: 3.50,
        image: "https://images.unsplash.com/photo-1589488766611-b2287a046189?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"
      }
    ]
  },
  {
    id: 3,
    category: "Cold Drinks",
    items: [
      {
        id: 301,
        name: "Iced Coffee",
        description: "Chilled coffee served with ice",
        basePrice: 3.00,
        image: "https://images.unsplash.com/photo-1578314675249-a6910f80cc39?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"
      },
      {
        id: 302,
        name: "Cold Brew",
        description: "Coffee brewed with cold water over time",
        basePrice: 3.50,
        image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"
      },
      {
        id: 303,
        name: "Lemonade",
        description: "Fresh squeezed lemonade",
        basePrice: 2.75,
        image: "https://images.unsplash.com/photo-1556881286-fc6915169721?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"
      }
    ]
  }
];

const sizes = [
  { id: 1, name: "Small", priceModifier: 0 },
  { id: 2, name: "Medium", priceModifier: 0.50 },
  { id: 3, name: "Large", priceModifier: 1.00 }
];

const options = [
  { id: 1, name: "Extra Shot", price: 0.75 },
  { id: 2, name: "Vanilla Syrup", price: 0.50 },
  { id: 3, name: "Caramel Syrup", price: 0.50 },
  { id: 4, name: "Hazelnut Syrup", price: 0.50 },
  { id: 5, name: "Almond Milk", price: 0.75 },
  { id: 6, name: "Oat Milk", price: 0.75 },
  { id: 7, name: "Whipped Cream", price: 0.50 },
  { id: 8, name: "Ice", price: 0 }
];

export { drinks, sizes, options }; 