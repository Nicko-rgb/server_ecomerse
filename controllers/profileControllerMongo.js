const mongoose = require('mongoose');

// Esquemas de MongoDB
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  phone: String,
  role: String,
  addresses: [{
    type: String,
    fullAddress: String,
    reference: String,
    isPrimary: Boolean,
    createdAt: { type: Date, default: Date.now }
  }],
  paymentMethods: [{
    type: String,
    title: String,
    cardNumber: String,
    cardHolder: String,
    expiryDate: String,
    isPrimary: Boolean,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{
    product: {
      name: String,
      image: String,
      price: Number
    },
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  status: String,
  shippingAddress: {
    fullAddress: String,
    reference: String
  },
  paymentMethod: {
    type: String,
    title: String
  },
  tracking: {
    number: String,
    carrier: String,
    status: String
  },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Order = mongoose.model('Order', orderSchema);

const profileController = {
  // Obtener perfil del usuario
  getProfile: async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          error: 'Usuario no encontrado' 
        });
      }

      const profileData = {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatar: user.avatar || null,
        role: user.role,
        createdAt: user.createdAt
      };

      res.json({ 
        success: true, 
        data: profileData 
      });
    } catch (error) {
      console.error('Error getting profile:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error interno del servidor' 
      });
    }
  },

  // Actualizar perfil del usuario
  updateProfile: async (req, res) => {
    try {
      const userId = req.params.id;
      const updates = req.body;

      const user = await User.findByIdAndUpdate(
        userId,
        {
          firstName: updates.firstName,
          lastName: updates.lastName,
          phone: updates.phone
        },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ 
          success: false, 
          error: 'Usuario no encontrado' 
        });
      }

      res.json({ 
        success: true, 
        message: 'Perfil actualizado correctamente',
        data: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone
        }
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error interno del servidor' 
      });
    }
  },

  // Obtener direcciones del usuario
  getAddresses: async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          error: 'Usuario no encontrado' 
        });
      }

      res.json({ 
        success: true, 
        data: user.addresses || [] 
      });
    } catch (error) {
      console.error('Error getting addresses:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error interno del servidor' 
      });
    }
  },

  // Agregar nueva dirección
  addAddress: async (req, res) => {
    try {
      const userId = req.params.id;
      const newAddress = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          error: 'Usuario no encontrado' 
        });
      }

      // Si es dirección principal, desmarcar las demás
      if (newAddress.isPrimary) {
        user.addresses.forEach(addr => {
          addr.isPrimary = false;
        });
      }

      // Agregar nueva dirección
      user.addresses.push({
        type: newAddress.type,
        fullAddress: newAddress.fullAddress,
        reference: newAddress.reference,
        isPrimary: newAddress.isPrimary || false
      });

      await user.save();

      res.json({ 
        success: true, 
        message: 'Dirección agregada correctamente',
        data: user.addresses[user.addresses.length - 1]
      });
    } catch (error) {
      console.error('Error adding address:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error interno del servidor' 
      });
    }
  },

  // Obtener métodos de pago
  getPaymentMethods: async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          error: 'Usuario no encontrado' 
        });
      }

      res.json({ 
        success: true, 
        data: user.paymentMethods || [] 
      });
    } catch (error) {
      console.error('Error getting payment methods:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error interno del servidor' 
      });
    }
  },

  // Agregar método de pago
  addPaymentMethod: async (req, res) => {
    try {
      const userId = req.params.id;
      const newMethod = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          error: 'Usuario no encontrado' 
        });
      }

      // Si es método principal, desmarcar los demás
      if (newMethod.isPrimary) {
        user.paymentMethods.forEach(method => {
          method.isPrimary = false;
        });
      }

      // Agregar nuevo método
      user.paymentMethods.push({
        type: newMethod.type,
        title: newMethod.title,
        cardNumber: newMethod.cardNumber || '',
        cardHolder: newMethod.cardHolder || '',
        expiryDate: newMethod.expiryDate || '',
        isPrimary: newMethod.isPrimary || false
      });

      await user.save();

      res.json({ 
        success: true, 
        message: 'Método de pago agregado correctamente',
        data: user.paymentMethods[user.paymentMethods.length - 1]
      });
    } catch (error) {
      console.error('Error adding payment method:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error interno del servidor' 
      });
    }
  }
};

module.exports = { profileController, User, Order };