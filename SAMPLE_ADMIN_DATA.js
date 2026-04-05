// SAMPLE DATA FOR ADMIN PANEL - Auto-seeded on first load
// Used by app.js Database class

export const SAMPLE_PRODUCTS = [
  {
    id: 1,
    name: "Australian Wagyu Ribeye A5",
    description: "Импортная мраморная говядина высшей категории A5. Нежнейший мрамор, идеальный баланс жира и мяса.",
    price: 12500,
    image: "https://images.unsplash.com/photo-1621996346565-e3adc590e6e5?w=400&h=300&fit=crop",
    category: "ribeye",
    weight: "350г",
    badge: "Премиум"
  },
  {
    id: 2,
    name: "USDA Prime Ribeye",
    description: "Американская говядина премиум-класса. Богатый мясной вкус с высокой мраморностью.",
    price: 8900,
    image: "https://images.unsplash.com/photo-1603048297194-8f7d9e4b7a47?w=400&h=300&fit=crop",
    category: "ribeye",
    weight: "400г",
    badge: "Хит"
  },
  {
    id: 3,
    name: "New Zealand Grass Fed Striploin",
    description: "Травяная говядина из Новой Зеландии. Нежная текстура, чистый вкус.",
    price: 7600,
    image: "https://images.unsplash.com/photo-1579762712865-3b4ee78054ca?w=400&h=300&fit=crop",
    category: "striploin",
    weight: "350г"
  },
  {
    id: 4,
    name: "Dry Aged T-Bone",
    description: "Сухая выдержка 28 дней. Богатый аромат и вкус, сочная мякоть.",
    price: 11200,
    image: "https://images.unsplash.com/photo-1617096700794-f0c8c7f6a196?w=400&h=300&fit=crop",
    category: "tbone",
    weight: "800г"
  },
  {
    id: 5,
    name: "Filet Mignon Center Cut",
    description: "Вырезка премиум-класса. Максимальная нежность без жира.",
    price: 14900,
    image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&h=300&fit=crop",
    category: "filet",
    weight: "250г",
    badge: "Новое"
  }
  // ... + 7 more premium steaks
];

export const SAMPLE_ORDERS = [
  {
    id: 1001,
    createdAt: "2024-01-15T10:30:00",
    items: [{name: "Ribeye A5", quantity: 2, price: 12500}],
    total: 27000,
    status: "Новый"
  },
  {
    id: 1002,
    createdAt: "2024-01-14T16:45:00", 
    items: [{name: "Striploin", quantity: 1, price: 7600}],
    total: 8600,
    status: "В обработке"
  }
  // ... + 3 more sample orders
];

