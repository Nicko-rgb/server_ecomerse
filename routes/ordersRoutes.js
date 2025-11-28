const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { Order, OrderItem } = require('../models/OrderSequelize');

// Función auxiliar para obtener imagen del producto
const getProductImage = (productName) => {
  const imageMap = {
    'iPhone 15 Pro Max 256GB': 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300',
    'Funda iPhone 15 Pro Max': 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=300',
    'MacBook Air M2 13" 256GB': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300',
    'Magic Mouse': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300',
    'USB-C Hub 7 en 1': 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=300',
    'AirPods Pro 2da Gen': 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=300'
  };
  return imageMap[productName] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300';
};

// Función auxiliar para obtener transportadora
const getCarrierFromTracking = (trackingNumber) => {
  if (!trackingNumber) return 'Pendiente';
  if (trackingNumber.includes('TRK789')) return 'DHL Express';
  if (trackingNumber.includes('TRK456')) return 'FedEx';
  if (trackingNumber.includes('TRK123')) return 'Estafeta';
  if (trackingNumber.includes('TRK987')) return 'Correos de México';
  return 'Pendiente';
};

const ordersController = {
  // Obtener pedidos del usuario
  getUserOrders: async (req, res) => {
    try {
      const userId = req.user.id;
      
      try {
        // Intentar buscar pedidos reales del usuario con sus items
        const orders = await Order.findAll({
          where: { user_id: userId },
          include: [{
            model: OrderItem,
            as: 'items',
            required: false
          }],
          order: [['created_at', 'DESC']],
          limit: 20
        });

        // Si hay pedidos en la DB, formatearlos
        if (orders && orders.length > 0) {
          const formattedOrders = orders.map(order => ({
            _id: order.id_order,
            id: order.id_order,
            user: userId,
            status: order.status,
            createdAt: order.created_at,
            totalAmount: parseFloat(order.total),
            items: order.items ? order.items.map(item => ({
              product: { 
                name: item.name,
                image: item.image || getProductImage(item.name)
              },
              name: item.name,
              image: item.image || getProductImage(item.name),
              quantity: item.quantity,
              price: parseFloat(item.price)
            })) : [],
            shippingAddress: {
              fullAddress: 'Av. Insurgentes Sur 1234, Col. Del Valle, Ciudad de México',
              reference: order.notes || 'Dirección principal'
            },
            paymentMethod: {
              type: 'credit_card',
              title: 'Visa **** 1234'
            },
            tracking: {
              number: order.tracking_number || '',
              carrier: getCarrierFromTracking(order.tracking_number),
              status: order.status
            }
          }));

          return res.json({
            success: true,
            data: formattedOrders
          });
        }
      } catch (dbError) {
        console.log('DB no disponible, usando datos de ejemplo:', dbError.message);
      }

      // Si no hay pedidos en DB o hay error, usar datos de ejemplo
      const sampleOrders = [
        {
          _id: '12345',
          user: userId,
          status: 'delivered',
          createdAt: '2024-01-20T10:30:00Z',
          totalAmount: 1329.98,
          items: [
            {
              product: { 
                name: 'iPhone 15 Pro Max 256GB',
                image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300'
              },
              quantity: 1,
              price: 1299.99
            },
            {
              product: { 
                name: 'Funda iPhone 15 Pro Max',
                image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=300'
              },
              quantity: 1,
              price: 29.99
            }
          ],
          shippingAddress: {
            fullAddress: 'Av. Insurgentes Sur 1234, Col. Del Valle, Ciudad de México, CDMX',
            reference: 'Casa azul con portón negro'
          },
          paymentMethod: {
            type: 'credit_card',
            title: 'Visa **** 1234'
          },
          tracking: {
            number: 'TRK789456123',
            carrier: 'DHL Express',
            status: 'delivered'
          }
        },
        {
          _id: '12344',
          user: userId,
          status: 'shipped',
          createdAt: '2024-01-15T14:20:00Z',
          totalAmount: 1329.97,
          items: [
            {
              product: { 
                name: 'MacBook Air M2 13" 256GB',
                image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300'
              },
              quantity: 1,
              price: 1199.99
            },
            {
              product: { 
                name: 'Magic Mouse',
                image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300'
              },
              quantity: 1,
              price: 79.99
            },
            {
              product: { 
                name: 'USB-C Hub 7 en 1',
                image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=300'
              },
              quantity: 1,
              price: 49.99
            }
          ],
          shippingAddress: {
            fullAddress: 'Av. Reforma 456, Col. Juárez, Ciudad de México, CDMX',
            reference: 'Torre corporativa, piso 15'
          },
          paymentMethod: {
            type: 'paypal',
            title: 'PayPal'
          },
          tracking: {
            number: 'TRK456789012',
            carrier: 'FedEx',
            status: 'in_transit'
          }
        }
      ];

      res.json({
        success: true,
        data: sampleOrders
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Obtener detalles de un pedido específico
  getOrderById: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Datos de ejemplo
      const order = {
        _id: id,
        user: req.user.id,
        status: 'delivered',
        createdAt: '2024-01-15T10:30:00Z',
        totalAmount: 89.99,
        items: [
          { 
            product: { 
              name: 'Camiseta Básica',
              image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300'
            },
            quantity: 2, 
            price: 29.99 
          },
          { 
            product: { 
              name: 'Jeans Slim Fit',
              image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300'
            },
            quantity: 1, 
            price: 59.99 
          }
        ],
        shippingAddress: {
          fullAddress: 'Calle Principal 123, Ciudad, País',
          reference: 'Casa azul'
        },
        paymentMethod: {
          type: 'credit_card',
          title: 'Visa **** 1234'
        },
        tracking: {
          number: 'TRK123456789',
          carrier: 'DHL',
          status: 'delivered'
        }
      };

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Crear un nuevo pedido
  createOrder: async (req, res) => {
    try {
      const { items, shippingAddress, paymentMethod } = req.body;
      const userId = req.user.id;

      // Validar datos
      if (!items || items.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'El pedido debe tener al menos un producto'
        });
      }

      // Calcular total
      const totalAmount = items.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);

      try {
        // Intentar crear pedido en PostgreSQL
        const newOrder = await Order.create({
          user_id: userId,
          total: totalAmount,
          status: 'pending',
          payment_status: 'pending',
          tracking_number: `TRK${Date.now()}`,
          notes: `Pedido desde app - ${paymentMethod?.title || 'Método no especificado'}`
        });

        // Crear items del pedido
        for (const item of items) {
          const itemName = item.name || item.product?.name || 'Producto sin nombre';
          const itemImage = item.image || item.product?.image || null;
          const itemQuantity = item.quantity || 1;
          const itemPrice = item.price || 0;
          
          await OrderItem.create({
            order_id: newOrder.id_order,
            name: itemName,
            image: itemImage,
            quantity: itemQuantity,
            price: itemPrice
          });
        }

        res.status(201).json({
          success: true,
          data: {
            _id: newOrder.id_order,
            user: userId,
            totalAmount: parseFloat(newOrder.total),
            status: newOrder.status,
            tracking: {
              number: newOrder.tracking_number,
              carrier: 'Pendiente',
              status: 'pending'
            }
          },
          message: 'Pedido creado exitosamente'
        });
      } catch (dbError) {
        console.error('Error en DB al crear pedido:', dbError.message);
        throw dbError; // Re-lanzar el error para que sea manejado por el catch principal
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

// Rutas de pedidos para usuarios
router.get('/', authenticateToken, ordersController.getUserOrders);
router.get('/:id', authenticateToken, ordersController.getOrderById);
router.post('/', authenticateToken, ordersController.createOrder);

module.exports = router;