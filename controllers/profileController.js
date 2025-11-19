const User = require('../models/User');

// Simulación de base de datos en memoria
let users = [
  {
    id: 1,
    email: 'usuario@ejemplo.com',
    firstName: 'Juan',
    lastName: 'Pérez',
    phone: '+1234567890',
    avatar: 'https://via.placeholder.com/150',
    dateOfBirth: '1990-01-15',
    gender: 'male',
    addresses: [
      {
        id: 1,
        type: 'home',
        street: 'Calle Principal 123',
        city: 'Ciudad',
        state: 'Estado',
        zipCode: '12345',
        country: 'País',
        isPrimary: true
      }
    ],
    paymentMethods: [
      {
        id: 1,
        type: 'credit_card',
        cardNumber: '**** **** **** 1234',
        cardHolder: 'Juan Pérez',
        expiryDate: '12/25',
        isPrimary: true
      }
    ],
    preferences: {
      notifications: true,
      newsletter: false,
      language: 'es'
    },
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date()
  }
];

const profileController = {
  // Obtener perfil del usuario
  getProfile: (req, res) => {
    try {
      const userId = req.params.id || 1; // Simulación
      const userData = users.find(u => u.id == userId);
      
      if (!userData) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const user = new User(userData);
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Actualizar perfil del usuario
  updateProfile: (req, res) => {
    try {
      const userId = req.params.id || 1;
      const updates = req.body;
      
      const userIndex = users.findIndex(u => u.id == userId);
      if (userIndex === -1) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Actualizar datos del usuario
      users[userIndex] = {
        ...users[userIndex],
        ...updates,
        updatedAt: new Date()
      };

      const updatedUser = new User(users[userIndex]);
      res.json({
        success: true,
        message: 'Perfil actualizado correctamente',
        data: updatedUser
      });
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Obtener direcciones del usuario
  getAddresses: (req, res) => {
    try {
      const userId = req.params.id || 1;
      const user = users.find(u => u.id == userId);
      
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json({
        success: true,
        data: user.addresses
      });
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Agregar nueva dirección
  addAddress: (req, res) => {
    try {
      const userId = req.params.id || 1;
      const newAddress = req.body;
      
      const userIndex = users.findIndex(u => u.id == userId);
      if (userIndex === -1) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Generar ID para la nueva dirección
      const newId = Math.max(...users[userIndex].addresses.map(a => a.id), 0) + 1;
      
      const address = {
        id: newId,
        ...newAddress,
        isPrimary: users[userIndex].addresses.length === 0 || newAddress.isPrimary
      };

      // Si es dirección principal, desmarcar las demás
      if (address.isPrimary) {
        users[userIndex].addresses.forEach(addr => addr.isPrimary = false);
      }

      users[userIndex].addresses.push(address);
      users[userIndex].updatedAt = new Date();

      res.json({
        success: true,
        message: 'Dirección agregada correctamente',
        data: address
      });
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Obtener métodos de pago
  getPaymentMethods: (req, res) => {
    try {
      const userId = req.params.id || 1;
      const user = users.find(u => u.id == userId);
      
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json({
        success: true,
        data: user.paymentMethods
      });
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Agregar método de pago
  addPaymentMethod: (req, res) => {
    try {
      const userId = req.params.id || 1;
      const newPaymentMethod = req.body;
      
      const userIndex = users.findIndex(u => u.id == userId);
      if (userIndex === -1) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const newId = Math.max(...users[userIndex].paymentMethods.map(pm => pm.id), 0) + 1;
      
      const paymentMethod = {
        id: newId,
        ...newPaymentMethod,
        isPrimary: users[userIndex].paymentMethods.length === 0 || newPaymentMethod.isPrimary
      };

      // Si es método principal, desmarcar los demás
      if (paymentMethod.isPrimary) {
        users[userIndex].paymentMethods.forEach(pm => pm.isPrimary = false);
      }

      users[userIndex].paymentMethods.push(paymentMethod);
      users[userIndex].updatedAt = new Date();

      res.json({
        success: true,
        message: 'Método de pago agregado correctamente',
        data: paymentMethod
      });
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

module.exports = profileController;