const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { users } = require('../data/database');

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro_cambiar_en_produccion';

const authController = {
  // Registro de usuario
  register: async (req, res) => {
    try {
      const { email, password, firstName, lastName, phone } = req.body;

      // Validaciones
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ 
          success: false,
          error: 'Todos los campos son obligatorios' 
        });
      }

      // Verificar si el usuario ya existe
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        return res.status(400).json({ 
          success: false,
          error: 'El email ya está registrado' 
        });
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          success: false,
          error: 'Email inválido' 
        });
      }

      // Validar longitud de contraseña
      if (password.length < 6) {
        return res.status(400).json({ 
          success: false,
          error: 'La contraseña debe tener al menos 6 caracteres' 
        });
      }

      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear nuevo usuario
      const newUser = {
        id: Math.max(...users.map(u => u.id), 0) + 1,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone || '',
        avatar: 'https://via.placeholder.com/150',
        dateOfBirth: '',
        gender: '',
        role: 'customer',
        active: true,
        addresses: [],
        paymentMethods: [],
        preferences: {
          notifications: true,
          newsletter: false,
          language: 'es'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      users.push(newUser);

      // Generar token
      const token = jwt.sign(
        { 
          id: newUser.id, 
          email: newUser.email, 
          role: newUser.role 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // No enviar la contraseña en la respuesta
      const { password: _, ...userWithoutPassword } = newUser;

      res.status(201).json({
        success: true,
        message: 'Usuario registrado correctamente',
        data: {
          user: userWithoutPassword,
          token
        }
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al registrar usuario' 
      });
    }
  },

  // Login de usuario
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validaciones
      if (!email || !password) {
        return res.status(400).json({ 
          success: false,
          error: 'Email y contraseña son obligatorios' 
        });
      }

      // Buscar usuario
      const user = users.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({ 
          success: false,
          error: 'Credenciales inválidas' 
        });
      }

      // Verificar si el usuario está activo
      if (!user.active) {
        return res.status(401).json({ 
          success: false,
          error: 'Usuario desactivado. Contacta al administrador' 
        });
      }

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          success: false,
          error: 'Credenciales inválidas' 
        });
      }

      // Generar token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // No enviar la contraseña en la respuesta
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: 'Login exitoso',
        data: {
          user: userWithoutPassword,
          token
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al iniciar sesión' 
      });
    }
  },

  // Verificar token
  verifyToken: (req, res) => {
    try {
      const user = users.find(u => u.id === req.user.id);
      
      if (!user) {
        return res.status(404).json({ 
          success: false,
          error: 'Usuario no encontrado' 
        });
      }

      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: {
          user: userWithoutPassword
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: 'Error al verificar token' 
      });
    }
  },

  // Cambiar contraseña
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ 
          success: false,
          error: 'Contraseña actual y nueva son obligatorias' 
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ 
          success: false,
          error: 'La nueva contraseña debe tener al menos 6 caracteres' 
        });
      }

      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        return res.status(404).json({ 
          success: false,
          error: 'Usuario no encontrado' 
        });
      }

      // Verificar contraseña actual
      const isPasswordValid = await bcrypt.compare(currentPassword, users[userIndex].password);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          success: false,
          error: 'Contraseña actual incorrecta' 
        });
      }

      // Encriptar nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      users[userIndex].password = hashedPassword;
      users[userIndex].updatedAt = new Date();

      res.json({
        success: true,
        message: 'Contraseña actualizada correctamente'
      });
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al cambiar contraseña' 
      });
    }
  }
};

module.exports = authController;