const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Importar rutas
const profileRoutes = require('./routes/profileRoutes');

// Usar rutas
app.use('/api', profileRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'Ecommerce API Server',
    version: '1.0.0',
    endpoints: {
      profile: '/api/profile/:id',
      addresses: '/api/profile/:id/addresses',
      paymentMethods: '/api/profile/:id/payment-methods'
    }
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
  console.log(`Local: http://localhost:${port}`);
  console.log(`Network: http://10.106.183.4:${port}`);
});
