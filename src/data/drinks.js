const drinks = [
  {
    id: 1,
    category: "咖啡",
    items: [
      {
        id: 101,
        name: "浓缩咖啡",
        description: "通过高压热水萃取细磨咖啡豆制成的浓咖啡",
        basePrice: 28.0,
        image:
          "https://images.unsplash.com/photo-1520516472218-ed48f8f1d9df?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
      },
      {
        id: 102,
        name: "卡布奇诺",
        description: "浓缩咖啡搭配蒸汽牛奶和奶泡",
        basePrice: 32.0,
        image:
          "https://images.unsplash.com/photo-1534778101976-62847782c213?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
      },
      {
        id: 103,
        name: "拿铁",
        description: "浓缩咖啡搭配蒸汽牛奶",
        basePrice: 35.0,
        image:
          "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
      },
    ],
  },
  {
    id: 2,
    category: "茶饮",
    items: [
      {
        id: 201,
        name: "绿茶",
        description: "富含抗氧化剂的清新茶饮",
        basePrice: 22.0,
        image:
          "https://images.unsplash.com/photo-1556682851-71e037122346?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
      },
      {
        id: 202,
        name: "伯爵红茶",
        description: "佛手柑风味红茶",
        basePrice: 25.0,
        image:
          "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
      },
      {
        id: 203,
        name: "印度奶茶",
        description: "香料茶与蒸汽牛奶混合",
        basePrice: 30.0,
        image:
          "https://images.unsplash.com/photo-1589488766611-b2287a046189?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
      },
    ],
  },
  {
    id: 3,
    category: "冷饮",
    items: [
      {
        id: 301,
        name: "冰咖啡",
        description: "冰镇咖啡配冰块饮用",
        basePrice: 28.0,
        image:
          "https://images.unsplash.com/photo-1578314675249-a6910f80cc39?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
      },
      {
        id: 302,
        name: "冷萃咖啡",
        description: "冷水长时间慢速萃取的咖啡",
        basePrice: 35.0,
        image:
          "https://images.unsplash.com/photo-1517701604599-bb29b565090c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
      },
      {
        id: 303,
        name: "柠檬水",
        description: "鲜榨柠檬饮品",
        basePrice: 20.0,
        image:
          "https://images.unsplash.com/photo-1556881286-fc6915169721?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
      },
    ],
  },
];

const sizes = [
  { id: 1, name: "小杯", priceModifier: 0 },
  { id: 2, name: "中杯", priceModifier: 5.0 },
  { id: 3, name: "大杯", priceModifier: 10.0 },
];

const options = [
  { id: 1, name: "加浓咖啡", price: 5.0 },
  { id: 2, name: "香草糖浆", price: 3.5 },
  { id: 3, name: "焦糖糖浆", price: 3.5 },
  { id: 4, name: "榛果糖浆", price: 3.5 },
  { id: 5, name: "杏仁奶", price: 5.0 },
  { id: 6, name: "燕麦奶", price: 5.0 },
  { id: 7, name: "鲜奶油", price: 3.5 },
  { id: 8, name: "冰块", price: 0 },
];

export { drinks, sizes, options };
