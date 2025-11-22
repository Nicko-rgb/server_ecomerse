const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productsRoutes = require('./routes/productsRoutes');

// Usar rutas
app.use('/api', authRoutes); // Rutas de autenticación (públicas)
app.use('/api', productsRoutes); // Rutas de productos (públicas)
app.use('/api', profileRoutes); // Rutas de perfil (protegidas)
app.use('/api', adminRoutes); // Rutas de admin (protegidas)

app.get('/', (req, res) => {
  res.json({ 
    message: 'Ecommerce API Server',
    version: '1.0.0',
    endpoints: {
      profile: '/api/profile/:id',
      addresses: '/api/profile/:id/addresses',
      paymentMethods: '/api/profile/:id/payment-methods',
      auth: {
        register: '/api/auth/register',
        login: '/api/auth/login',
        verify: '/api/auth/verify',
        changePassword: '/api/auth/change-password'
      },
      products: '/api/products',
      productsFeatured: '/api/products/featured',
      categories: '/api/products/categories',
      admin: {
        dashboard: '/api/admin/dashboard/stats',
        products: '/api/admin/products',
        orders: '/api/admin/orders',
        users: '/api/admin/users'
      }
    }
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
  console.log(`Local: http://localhost:${port}`);
  console.log(`Network: http://10.106.183.4:${port}`);
});
