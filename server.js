// ===================================
// PREMIUM STEAK HOUSE - SERVER
// Node.js + Express + MongoDB
// ===================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ===================================
// MIDDLEWARE
// ===================================
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ===================================
// MONGOOSE MODELS
// ===================================

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  badge: { type: String, default: null },
  weight: { type: String, required: true }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

// Cart Item Schema
const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, default: 1 },
  sessionId: { type: String, required: true }
}, { timestamps: true });

const CartItem = mongoose.model('CartItem', cartItemSchema);

// Order Schema
const orderSchema = new mongoose.Schema({
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  total: { type: Number, required: true },
  status: { type: String, default: 'Новый' },
  customer: {
    name: String,
    phone: String,
    address: String
  },
  sessionId: { type: String, required: true }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

// ===================================
// API ROUTES - PRODUCTS
// ===================================

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get products by category
app.get('/api/products/category/:category', async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new product
app.post('/api/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===================================
// API ROUTES - CART
// ===================================

// Get cart by session
app.get('/api/cart/:sessionId', async (req, res) => {
  try {
    const cartItems = await CartItem.find({ sessionId: req.params.sessionId }).populate('productId');
    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add to cart
app.post('/api/cart', async (req, res) => {
  try {
    const { productId, sessionId } = req.body;
    
    let cartItem = await CartItem.findOne({ productId, sessionId });
    
    if (cartItem) {
      cartItem.quantity += 1;
      await cartItem.save();
    } else {
      cartItem = new CartItem({ productId, sessionId, quantity: 1 });
      await cartItem.save();
    }
    
    const populatedCart = await CartItem.find({ sessionId }).populate('productId');
    res.json(populatedCart);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update cart item quantity
app.put('/api/cart/:id', async (req, res) => {
  try {
    const { quantity } = req.body;
    
    if (quantity <= 0) {
      await CartItem.findByIdAndDelete(req.params.id);
      return res.json([]);
    }
    
    const cartItem = await CartItem.findByIdAndUpdate(
      req.params.id,
      { quantity },
      { new: true }
    ).populate('productId');
    
    const sessionId = cartItem.sessionId;
    const allCartItems = await CartItem.find({ sessionId }).populate('productId');
    res.json(allCartItems);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Remove from cart
app.delete('/api/cart/:id', async (req, res) => {
  try {
    const cartItem = await CartItem.findById(req.params.id);
    if (!cartItem) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    const sessionId = cartItem.sessionId;
    await CartItem.findByIdAndDelete(req.params.id);
    
    const allCartItems = await CartItem.find({ sessionId }).populate('productId');
    res.json(allCartItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear cart
app.delete('/api/cart/session/:sessionId', async (req, res) => {
  try {
    await CartItem.deleteMany({ sessionId: req.params.sessionId });
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===================================
// API ROUTES - ORDERS
// ===================================

// Create order
app.post('/api/orders', async (req, res) => {
  try {
    const { items, customer, sessionId, total } = req.body;
    
    const order = new Order({
      items,
      total,
      customer,
      sessionId
    });
    
    await order.save();
    
    // Clear cart after order
    await CartItem.deleteMany({ sessionId });
    
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get orders by session
app.get('/api/orders/session/:sessionId', async (req, res) => {
  try {
    const orders = await Order.find({ sessionId: req.params.sessionId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all orders (for admin)
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status
app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ===================================
// SEED DEFAULT PRODUCTS
// ===================================
async function seedProducts() {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      const defaultProducts = [
        {
          name: 'Ribeye Prime',
          description: 'Мраморная говядина высшей категории. Максимальная мраморность и насыщенный вкус.',
          price: 4900,
          image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=300&fit=crop',
          category: 'ribeye',
          badge: 'Хит',
          weight: '350 г'
        },
        {
          name: 'Striploin Premium',
          description: 'Идеальный баланс сочности и текстуры. Классический стейк.',
          price: 4300,
          image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop',
          category: 'striploin',
          badge: null,
          weight: '300 г'
        },
        {
          name: 'T-Bone Classic',
          description: 'Два вкуса в одном легендарном стейке. Филейная часть и стейк.',
          price: 5600,
          image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
          category: 'tbone',
          badge: 'Премиум',
          weight: '450 г'
        },
        {
          name: 'Filet Mignon',
          description: 'Нежнейшая вырезка. Самая мягкая часть говядины.',
          price: 6200,
          image: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?w=400&h=300&fit=crop',
          category: 'filet',
          badge: 'Эксклюзив',
          weight: '280 г'
        },
        {
          name: 'Tomahawk',
          description: 'Впечатляющий стейк на кости. Для настоящих ценителей.',
          price: 7800,
          image: 'https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?w=400&h=300&fit=crop',
          category: 'tomahawk',
          badge: 'Хит',
          weight: '800 г'
        },
        {
          name: 'Porterhouse',
          description: 'Большая версия T-Bone. Максимум вкуса.',
          price: 6400,
          image: 'https://images.unsplash.com/photo-1606850780554-b55ea4dd0b70?w=400&h=300&fit=crop',
          category: 'porterhouse',
          badge: null,
          weight: '600 г'
        },
        {
          name: 'Ribeye Dry Aged 45 дней',
          description: 'Говядина выдержанная 45 дней. Интенсивный вкус.',
          price: 8900,
          image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400&h=300&fit=crop',
          category: 'ribeye',
          badge: 'Dry Aged',
          weight: '350 г'
        },
        {
          name: 'Chateaubriand',
          description: 'Центральная часть вырезки. Блюдо для особых случаев.',
          price: 9500,
          image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
          category: 'filet',
          badge: 'Премиум',
          weight: '400 г'
        }
      ];
      
      await Product.insertMany(defaultProducts);
      console.log('✅ Default products seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding products:', error);
  }
}

// ===================================
// MONGODB CONNECTION & SERVER START
// ===================================
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/steakhouse';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    seedProducts();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

module.exports = app;
