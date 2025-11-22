const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// Importar base de datos compartida
const { products, orders, users } = require('../data/database');

// Usar datos compartidos
const oldOrders = [
  {
    id: '12345',
    userId: 1,
    items: [
      { productId: 1, name: 'Camiseta Básica', quantity: 2, price: 29.99 },
      { productId: 2, name: 'Jeans Slim Fit', quantity: 1, price: 59.99 }
    ],
    total: 119.97,
    status: 'delivered',
    shippingAddress: {
      street: 'Calle Principal 123',
      city: 'Ciudad',
      state: 'Estado',
      zipCode: '12345',
      country: 'País'
    },
    paymentMethod: 'credit_card',
    paymentStatus: 'paid',
    trackingNumber: 'TR123452024',
    notes: '',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: '12346',
    userId: 1,
    items: [
      { productId: 3, name: 'Zapatillas Deportivas', quantity: 1, price: 89.99 }
    ],
    total: 89.99,
    status: 'processing',
    shippingAddress: {
      street: 'Calle Principal 123',
      city: 'Ciudad',
      state: 'Estado',
      zipCode: '12345',
      country: 'País'
    },
    paymentMethod: 'credit_card',
    paymentStatus: 'paid',
    trackingNumber: null,
    notes: '',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date()
  }
];

// Los usuarios ya están importados de database.js

const adminController = {
  // ============ DASHBOARD ============
  getDashboardStats: (req, res) => {
    try {
      const stats = {
        totalProducts: products.length,
        activeProducts: products.filter(p => p.active).length,
        lowStockProducts: products.filter(p => p.stock < 10).length,
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        processingOrders: orders.filter(o => o.status === 'processing').length,
        deliveredOrders: orders.filter(o => o.status === 'delivered').length,
        totalRevenue: orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0),
        totalUsers: users.length,
        activeUsers: users.filter(u => u.active).length,
        newUsersThisMonth: users.filter(u => {
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return new Date(u.createdAt) > monthAgo;
        }).length
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  },

  getRecentActivity: (req, res) => {
    try {
      const recentOrders = orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      const recentUsers = users
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      res.json({
        success: true,
        data: {
          recentOrders,
          recentUsers
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener actividad reciente' });
    }
  },

  // ============ PRODUCTOS ============
  getAllProducts: (req, res) => {
    try {
      const { category, active, search } = req.query;
      let filteredProducts = [...products];

      if (category) {
        filteredProducts = filteredProducts.filter(p => p.category === category);
      }

      if (active !== undefined) {
        filteredProducts = filteredProducts.filter(p => p.active === (active === 'true'));
      }

      if (search) {
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase())
        );
      }

      res.json({
        success: true,
        data: filteredProducts.map(p => new Product(p))
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener productos' });
    }
  },

  getProduct: (req, res) => {
    try {
      const product = products.find(p => p.id == req.params.id);
      
      if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      res.json({
        success: true,
        data: new Product(product)
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener producto' });
    }
  },

  createProduct: (req, res) => {
    try {
      const newProduct = {
        id: Math.max(...products.map(p => p.id), 0) + 1,
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      products.push(newProduct);

      res.json({
        success: true,
        message: 'Producto creado correctamente',
        data: new Product(newProduct)
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al crear producto' });
    }
  },

  updateProduct: (req, res) => {
    try {
      const index = products.findIndex(p => p.id == req.params.id);
      
      if (index === -1) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      products[index] = {
        ...products[index],
        ...req.body,
        updatedAt: new Date()
      };

      res.json({
        success: true,
        message: 'Producto actualizado correctamente',
        data: new Product(products[index])
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar producto' });
    }
  },

  deleteProduct: (req, res) => {
    try {
      const index = products.findIndex(p => p.id == req.params.id);
      
      if (index === -1) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      products.splice(index, 1);

      res.json({
        success: true,
        message: 'Producto eliminado correctamente'
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar producto' });
    }
  },

  // ============ PEDIDOS ============
  getAllOrders: (req, res) => {
    try {
      const { status, paymentStatus } = req.query;
      let filteredOrders = [...orders];

      if (status) {
        filteredOrders = filteredOrders.filter(o => o.status === status);
      }

      if (paymentStatus) {
        filteredOrders = filteredOrders.filter(o => o.paymentStatus === paymentStatus);
      }

      res.json({
        success: true,
        data: filteredOrders.map(o => new Order(o))
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener pedidos' });
    }
  },

  getOrder: (req, res) => {
    try {
      const order = orders.find(o => o.id === req.params.id);
      
      if (!order) {
        return res.status(404).json({ error: 'Pedido no encontrado' });
      }

      res.json({
        success: true,
        data: new Order(order)
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener pedido' });
    }
  },

  updateOrderStatus: (req, res) => {
    try {
      const { status, trackingNumber, notes } = req.body;
      const index = orders.findIndex(o => o.id === req.params.id);
      
      if (index === -1) {
        return res.status(404).json({ error: 'Pedido no encontrado' });
      }

      orders[index] = {
        ...orders[index],
        status: status || orders[index].status,
        trackingNumber: trackingNumber || orders[index].trackingNumber,
        notes: notes !== undefined ? notes : orders[index].notes,
        updatedAt: new Date()
      };

      res.json({
        success: true,
        message: 'Pedido actualizado correctamente',
        data: new Order(orders[index])
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar pedido' });
    }
  },

  // ============ USUARIOS ============
  getAllUsers: (req, res) => {
    try {
      const { role, active } = req.query;
      let filteredUsers = [...users];

      if (role) {
        filteredUsers = filteredUsers.filter(u => u.role === role);
      }

      if (active !== undefined) {
        filteredUsers = filteredUsers.filter(u => u.active === (active === 'true'));
      }

      res.json({
        success: true,
        data: filteredUsers.map(u => new User(u))
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener usuarios' });
    }
  },

  getUser: (req, res) => {
    try {
      const user = users.find(u => u.id == req.params.id);
      
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json({
        success: true,
        data: new User(user)
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener usuario' });
    }
  },

  updateUser: (req, res) => {
    try {
      const index = users.findIndex(u => u.id == req.params.id);
      
      if (index === -1) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      users[index] = {
        ...users[index],
        ...req.body,
        updatedAt: new Date()
      };

      res.json({
        success: true,
        message: 'Usuario actualizado correctamente',
        data: new User(users[index])
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar usuario' });
    }
  }
};

module.exports = adminController;