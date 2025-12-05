const { models, initAssociations } = require('../models');
const { Order, OrderItem, User, DataUser } = models;
const crypto = require('crypto');

initAssociations();

const ordersController = {
  createOrder: async (req, res) => {
    try {
      const userId = req.user && req.user.id;
      const { items, total, paymentMethod, paymentDetails, shippingAddress, notes } = req.body || {};
      if (!userId) return res.status(401).json({ success: false, error: 'No autenticado' });
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, error: 'Items del pedido requeridos' });
      }

      const t = await Order.sequelize.transaction();
      try {
        const gen = async () => {
          for (;;) {
            const num = Array.from({ length: 11 }, () => crypto.randomInt(0, 10)).join('');
            const exists = await Order.findOne({ where: { order_number: num } });
            if (!exists) return num;
          }
        };
        const orderNumber = await gen();
        const order = await Order.create({
          user_id: userId,
          order_number: orderNumber,
          total: Number(total || 0),
          status: 'processing',
          payment_status: paymentMethod === 'cash' ? 'pending' : 'paid',
          notes: notes || null,
        }, { transaction: t });

                for (const it of items) {
                    await OrderItem.create({
                        order_id: order.id_order,
                        product_id: it.product_id || null,
                        name: String(it.name || 'Producto'),
                        quantity: Number(it.quantity || 1),
                        price: Number(it.price || 0)
                    }, { transaction: t });
                }

                if (shippingAddress && typeof shippingAddress === 'object') {
                    const du = await DataUser.findOne({ where: { user_id: userId } });
                    const payload = {
                        address: shippingAddress.address || du?.address || null,
                        city: shippingAddress.city || du?.city || null,
                        postal_code: shippingAddress.zipCode || du?.postal_code || null,
                        country: shippingAddress.country || du?.country || null,
                    };
                    if (du) {
                        await du.update(payload, { transaction: t });
                    } else {
                        await DataUser.create({ user_id: userId, ...payload }, { transaction: t });
                    }
                }

                await t.commit();
                const base = order.toJSON();
                const resultOrder = {
                    id: base.id_order,
                    user_id: base.user_id,
                    total: base.total,
                    status: base.status,
                    payment_status: base.payment_status,
                    order_number: base.order_number,
                    tracking_number: base.tracking_number,
                    notes: base.notes,
                    createdAt: base.created_at,
                    updatedAt: base.updated_at,
                };
                return res.status(201).json({ success: true, data: { order: resultOrder } });
            } catch (e) {
                await t.rollback();
                console.error('Error creando pedido:', e.message);
                return res.status(500).json({ success: false, error: 'Error al crear el pedido' });
            }
        } catch (error) {
            console.error('Error createOrder:', error.message);
            res.status(500).json({ success: false, error: 'Error del servidor' });
        }
    },

    listOrders: async (req, res) => {
        try {
            const userId = req.user && req.user.id;
            if (!userId) return res.status(401).json({ success: false, error: 'No autenticado' });
            const orders = await Order.findAll({
                where: { user_id: userId },
                order: [['created_at', 'DESC']]
            });
            const withItems = await Promise.all(orders.map(async (o) => {
                const items = await OrderItem.findAll({ where: { order_id: o.id_order } });
                const base = o.toJSON();
                return {
                    id: base.id_order,
                    user_id: base.user_id,
                    total: base.total,
                    status: base.status,
                    payment_status: base.payment_status,
                    order_number: base.order_number,
                    tracking_number: base.tracking_number,
                    notes: base.notes,
                    createdAt: base.created_at,
                    updatedAt: base.updated_at,
                    items
                };
            }));
            res.json({ success: true, data: withItems });
        } catch (error) {
            console.error('Error listOrders:', error.message);
            res.status(500).json({ success: false, error: 'Error al listar pedidos' });
        }
    },

    getOrder: async (req, res) => {
        try {
            const userId = req.user && req.user.id;
            const id = parseInt(req.params.id);
            const order = await Order.findOne({ where: { id_order: id, user_id: userId } });
            if (!order) return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
            const items = await OrderItem.findAll({ where: { order_id: order.id_order } });
            const base = order.toJSON();
                res.json({
                success: true, data: {
                    id: base.id_order,
                    user_id: base.user_id,
                    total: base.total,
                    status: base.status,
                    payment_status: base.payment_status,
                    order_number: base.order_number,
                    tracking_number: base.tracking_number,
                    notes: base.notes,
                    createdAt: base.created_at,
                    updatedAt: base.updated_at,
                    items
                }
            });
        } catch (error) {
            console.error('Error getOrder:', error.message);
            res.status(500).json({ success: false, error: 'Error al obtener pedido' });
        }
    }
};

module.exports = ordersController;
