// ===================================
// PREMIUM STEAK HOUSE - SERVER
// Node.js + Express + PostgreSQL
// ===================================

require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL || process.env.PG_URI || 'postgresql://postgres:postgres@localhost:5432/steakhouse';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

async function runQuery(text, params = []) {
  const result = await pool.query(text, params);
  return result;
}

async function initDatabase() {
  await runQuery(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price INTEGER NOT NULL,
      image TEXT NOT NULL,
      category TEXT NOT NULL,
      badge TEXT,
      weight TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await runQuery(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL DEFAULT 1,
      session_id TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await runQuery(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      total INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'Новый',
      customer_name TEXT,
      customer_phone TEXT,
      customer_email TEXT,
      customer_city TEXT,
      customer_address TEXT,
      customer_apartment TEXT,
      comment TEXT,
      delivery_method TEXT,
      payment_method TEXT,
      session_id TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await runQuery(`
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER,
      name TEXT,
      price INTEGER,
      quantity INTEGER,
      image TEXT
    );
  `);
}

async function seedProducts() {
  const result = await runQuery('SELECT COUNT(*)::int AS count FROM products');
  const count = result.rows[0].count;

  if (count === 0) {
    const defaultProducts = [
      {
        name: 'Ribeye Prime',
        description: 'Мраморная говядина высшей категории. Максимальная мраморность и насыщенный вкус.',
        price: 8900,
        image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=300&fit=crop',
        category: 'ribeye',
        badge: 'Хит',
        weight: '350 г'
      },
      {
        name: 'Striploin Premium',
        description: 'Идеальный баланс сочности и текстуры. Классический стейк для гурманов.',
        price: 7500,
        image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&h=300&fit=crop',
        category: 'striploin',
        badge: null,
        weight: '300 г'
      },
      {
        name: 'T-Bone Classic',
        description: 'Два вкуса в одном легендарном стейке. Филейная часть и стейк на кости.',
        price: 9500,
        image: 'https://images.unsplash.com/photo-1430139593276-c3f7bff29cbb?w=400&h=300&fit=crop',
        category: 'tbone',
        badge: 'Премиум',
        weight: '450 г'
      },
      {
        name: 'Filet Mignon',
        description: 'Нежнейшая вырезка из Аргентины. Самая мягкая и деликатная часть.',
        price: 10500,
        image: 'https://images.unsplash.com/photo-1595521624410-5e77e1b6aed3?w=400&h=300&fit=crop',
        category: 'filet',
        badge: 'Эксклюзив',
        weight: '280 г'
      },
      {
        name: 'Tomahawk',
        description: 'Впечатляющий стейк на кости. Для настоящих ценителей экстра-класса.',
        price: 13900,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
        category: 'tomahawk',
        badge: 'Хит',
        weight: '800 г'
      },
      {
        name: 'Porterhouse',
        description: 'Большая версия T-Bone. Максимум вкуса и мраморности из набора премиум.',
        price: 10500,
        image: 'https://images.unsplash.com/photo-1543187776-ca038cad3260?w=400&h=300&fit=crop',
        category: 'porterhouse',
        badge: null,
        weight: '600 г'
      },
      {
        name: 'Ribeye Dry Aged 45 дней',
        description: 'Говядина выдержанная 45 дней. Интенсивный, глубокий вкус неповторимый.',
        price: 15900,
        image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&h=300&fit=crop',
        category: 'ribeye',
        badge: 'Dry Aged',
        weight: '350 г'
      },
      {
        name: 'Chateaubriand',
        description: 'Центральная часть вырезки из лучших поставок. Блюдо для особых случаев.',
        price: 16900,
        image: 'https://images.unsplash.com/photo-1599888657139-87e8624f31ad?w=400&h=300&fit=crop',
        category: 'filet',
        badge: 'Премиум',
        weight: '400 г'
      }
    ];

    const insertQuery = `
      INSERT INTO products (name, description, price, image, category, badge, weight)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    for (const product of defaultProducts) {
      await runQuery(insertQuery, [
        product.name,
        product.description,
        product.price,
        product.image,
        product.category,
        product.badge,
        product.weight
      ]);
    }

    console.log('✅ Default products seeded successfully');
  }
}

function mapProduct(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    image: row.image,
    category: row.category,
    badge: row.badge,
    weight: row.weight
  };
}

function mapCartItem(row) {
  return {
    id: row.id,
    productId: row.product_id,
    quantity: row.quantity,
    sessionId: row.session_id,
    product: row.product_name ? {
      id: row.product_id,
      name: row.product_name,
      price: row.product_price,
      image: row.product_image,
      category: row.product_category,
      badge: row.product_badge,
      weight: row.product_weight
    } : null
  };
}

function mapOrder(row) {
  return {
    id: row.id,
    total: row.total,
    status: row.status,
    customer: {
      name: row.customer_name,
      phone: row.customer_phone,
      email: row.customer_email,
      city: row.customer_city,
      address: row.customer_address,
      apartment: row.customer_apartment
    },
    comment: row.comment,
    deliveryMethod: row.delivery_method,
    paymentMethod: row.payment_method,
    delivery: row.delivery_method,
    payment: row.payment_method,
    sessionId: row.session_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function getOrderItems(orderId) {
  const result = await runQuery(
    `SELECT id, product_id, name, price, quantity, image FROM order_items WHERE order_id = $1`,
    [orderId]
  );
  return result.rows.map(item => ({
    id: item.id,
    productId: item.product_id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.image
  }));
}

// ===================================
// API ROUTES - PRODUCTS
// ===================================

app.get('/api/products', async (req, res) => {
  try {
    const result = await runQuery('SELECT * FROM products ORDER BY id');
    res.json(result.rows.map(mapProduct));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const result = await runQuery('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(mapProduct(result.rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/category/:category', async (req, res) => {
  try {
    const result = await runQuery('SELECT * FROM products WHERE category = $1 ORDER BY id', [req.params.category]);
    res.json(result.rows.map(mapProduct));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, description, price, image, category, badge, weight } = req.body;
    const result = await runQuery(
      `INSERT INTO products (name, description, price, image, category, badge, weight)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, description, price, image, category, badge, weight]
    );
    res.status(201).json(mapProduct(result.rows[0]));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { name, description, price, image, category, badge, weight } = req.body;
    const result = await runQuery(
      `UPDATE products SET name = $1, description = $2, price = $3, image = $4, category = $5, badge = $6, weight = $7, updated_at = NOW()
       WHERE id = $8 RETURNING *`,
      [name, description, price, image, category, badge, weight, req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(mapProduct(result.rows[0]));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const result = await runQuery('DELETE FROM products WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) {
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

app.get('/api/cart/:sessionId', async (req, res) => {
  try {
    const result = await runQuery(
      `SELECT ci.id, ci.product_id, ci.quantity, ci.session_id,
              p.name AS product_name, p.price AS product_price, p.image AS product_image,
              p.category AS product_category, p.badge AS product_badge, p.weight AS product_weight
       FROM cart_items ci
       LEFT JOIN products p ON ci.product_id = p.id
       WHERE ci.session_id = $1
       ORDER BY ci.created_at`,
      [req.params.sessionId]
    );
    res.json(result.rows.map(mapCartItem));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/cart', async (req, res) => {
  try {
    const { productId, sessionId } = req.body;
    const existing = await runQuery(
      'SELECT * FROM cart_items WHERE product_id = $1 AND session_id = $2',
      [productId, sessionId]
    );

    if (existing.rowCount > 0) {
      await runQuery(
        'UPDATE cart_items SET quantity = quantity + 1, updated_at = NOW() WHERE id = $1',
        [existing.rows[0].id]
      );
    } else {
      await runQuery(
        'INSERT INTO cart_items (product_id, session_id, quantity) VALUES ($1, $2, 1)',
        [productId, sessionId]
      );
    }

    const cartResult = await runQuery(
      `SELECT ci.id, ci.product_id, ci.quantity, ci.session_id,
              p.name AS product_name, p.price AS product_price, p.image AS product_image,
              p.category AS product_category, p.badge AS product_badge, p.weight AS product_weight
       FROM cart_items ci
       LEFT JOIN products p ON ci.product_id = p.id
       WHERE ci.session_id = $1 ORDER BY ci.created_at`,
      [sessionId]
    );
    res.json(cartResult.rows.map(mapCartItem));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/cart/:id', async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity <= 0) {
      const existing = await runQuery('SELECT session_id FROM cart_items WHERE id = $1', [req.params.id]);
      if (existing.rowCount === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }
      await runQuery('DELETE FROM cart_items WHERE id = $1', [req.params.id]);
      return res.json([]);
    }

    const updateResult = await runQuery(
      'UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE id = $2 RETURNING session_id',
      [quantity, req.params.id]
    );

    if (updateResult.rowCount === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const sessionId = updateResult.rows[0].session_id;
    const cartResult = await runQuery(
      `SELECT ci.id, ci.product_id, ci.quantity, ci.session_id,
              p.name AS product_name, p.price AS product_price, p.image AS product_image,
              p.category AS product_category, p.badge AS product_badge, p.weight AS product_weight
       FROM cart_items ci
       LEFT JOIN products p ON ci.product_id = p.id
       WHERE ci.session_id = $1 ORDER BY ci.created_at`,
      [sessionId]
    );
    res.json(cartResult.rows.map(mapCartItem));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/cart/:id', async (req, res) => {
  try {
    const existing = await runQuery('SELECT session_id FROM cart_items WHERE id = $1', [req.params.id]);
    if (existing.rowCount === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    const sessionId = existing.rows[0].session_id;
    await runQuery('DELETE FROM cart_items WHERE id = $1', [req.params.id]);
    const cartResult = await runQuery(
      `SELECT ci.id, ci.product_id, ci.quantity, ci.session_id,
              p.name AS product_name, p.price AS product_price, p.image AS product_image,
              p.category AS product_category, p.badge AS product_badge, p.weight AS product_weight
       FROM cart_items ci
       LEFT JOIN products p ON ci.product_id = p.id
       WHERE ci.session_id = $1 ORDER BY ci.created_at`,
      [sessionId]
    );
    res.json(cartResult.rows.map(mapCartItem));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/cart/session/:sessionId', async (req, res) => {
  try {
    await runQuery('DELETE FROM cart_items WHERE session_id = $1', [req.params.sessionId]);
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===================================
// API ROUTES - ORDERS
// ===================================

app.post('/api/orders', async (req, res) => {
  try {
    const { items, customer, sessionId, total, deliveryMethod, paymentMethod } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    const result = await runQuery(
      `INSERT INTO orders (
        total, status, customer_name, customer_phone, customer_email,
        customer_city, customer_address, customer_apartment, comment,
        delivery_method, payment_method, session_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        total,
        'Новый',
        customer.firstName ? `${customer.firstName} ${customer.lastName || ''}`.trim() : null,
        customer.phone,
        customer.email,
        customer.city,
        customer.address,
        customer.apartment,
        customer.comment,
        deliveryMethod,
        paymentMethod,
        sessionId
      ]
    );

    const orderId = result.rows[0].id;
    const insertItemQuery = `
      INSERT INTO order_items (order_id, product_id, name, price, quantity, image)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;

    for (const item of items) {
      await runQuery(insertItemQuery, [orderId, item.id || item.productId, item.name, item.price, item.quantity, item.image]);
    }

    await runQuery('DELETE FROM cart_items WHERE session_id = $1', [sessionId]);

    const order = mapOrder(result.rows[0]);
    order.items = items;
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/orders/session/:sessionId', async (req, res) => {
  try {
    const ordersResult = await runQuery(
      'SELECT * FROM orders WHERE session_id = $1 ORDER BY created_at DESC',
      [req.params.sessionId]
    );

    const orders = [];
    for (const row of ordersResult.rows) {
      const order = mapOrder(row);
      order.items = await getOrderItems(order.id);
      orders.push(order);
    }
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const result = await runQuery('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const order = mapOrder(result.rows[0]);
    order.items = await getOrderItems(order.id);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const email = req.query.email;
    let ordersResult;
    if (email) {
      ordersResult = await runQuery('SELECT * FROM orders WHERE customer_email = $1 ORDER BY created_at DESC', [email]);
    } else {
      ordersResult = await runQuery('SELECT * FROM orders ORDER BY created_at DESC');
    }
    const orders = [];
    for (const row of ordersResult.rows) {
      const order = mapOrder(row);
      order.items = await getOrderItems(order.id);
      orders.push(order);
    }
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const result = await runQuery(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = mapOrder(result.rows[0]);
    order.items = await getOrderItems(order.id);
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

async function startServer() {
  try {
    await initDatabase();
    await seedProducts();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
