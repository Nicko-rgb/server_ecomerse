const Product = require('../models/Product');
const User = require('../models/User');
const { Order } = require('../models/OrderSequelize');
const Promotion = require('../models/Promotion');
const PromotionProduct = require('../models/PromotionProduct');
const sequelize = require('../config/db');

const adminController = {
    getDashboardStats: async (req, res) => {
        try {
            const totalProducts = await Product.count();
            const activeProducts = await Product.count({ where: { active: true } });
            const lowStockProducts = await Product.count({ where: { stock: { [sequelize.Sequelize.Op.lt]: 10 } } });
            const totalOrders = await Order.count();
            const pendingOrders = await Order.count({ where: { status: 'pending' } });
            const processingOrders = await Order.count({ where: { status: 'processing' } });
            const deliveredOrders = await Order.count({ where: { status: 'delivered' } });
            const paidOrders = await Order.findAll({ where: { payment_status: 'paid' }, attributes: ['total'] });
            const totalRevenue = paidOrders.reduce((sum, o) => sum + parseFloat(o.total), 0);
            const totalUsers = await User.count();
            const activeUsers = await User.count({ where: { active: true } });
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            const newUsersThisMonth = await User.count({ where: { registered_at: { [sequelize.Sequelize.Op.gt]: monthAgo } } });
            res.json({ success: true, data: { totalProducts, activeProducts, lowStockProducts, totalOrders, pendingOrders, processingOrders, deliveredOrders, totalRevenue, totalUsers, activeUsers, newUsersThisMonth } });
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener estadísticas' });
        }
    },

    getRecentActivity: async (req, res) => {
        try {
            const recentOrders = await Order.findAll({ order: [['created_at', 'DESC']], limit: 5 });
            const recentUsers = await User.findAll({ order: [['registered_at', 'DESC']], limit: 5 });
            res.json({ success: true, data: { recentOrders, recentUsers } });
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener actividad reciente' });
        }
    },

    getAllProducts: async (req, res) => {
        try {
            const { category, active, search, page = 1, limit = 20, random } = req.query;
            const where = {};
            if (active !== undefined) where.active = active === 'true';
            if (category) where.category_id = category; // asumir category_id desde cliente
            if (search) {
                const Op = sequelize.Sequelize.Op;
                const s = String(search);
                where[Op.or] = [
                    { name: { [Op.iLike]: `%${s}%` } },
                    { description: { [Op.iLike]: `%${s}%` } }
                ];
            }

            const pageNum = Math.max(parseInt(page) || 1, 1);
            const limitNum = Math.max(parseInt(limit) || 20, 1);
            const offset = (pageNum - 1) * limitNum;

            const total = await Product.count({ where });

            const order = random === 'true'
                ? sequelize.Sequelize.literal('RANDOM()')
                : [['id_product', 'DESC']];

            const products = await Product.findAll({ where, order, limit: limitNum, offset });
            const list = products.map(p => ({ id: p.id_product, name: p.name, description: p.description, price: parseFloat(p.price), stock: p.stock, category_id: p.category_id, images: p.images, active: p.active }));

            res.json({ success: true, data: list, page: pageNum, limit: limitNum, total, hasMore: offset + list.length < total });
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener productos' });
        }
    },

    getProduct: async (req, res) => {
        try {
            const p = await Product.findByPk(req.params.id);
            if (!p) return res.status(404).json({ error: 'Producto no encontrado' });
            res.json({ success: true, data: { id: p.id_product, name: p.name, description: p.description, price: parseFloat(p.price), stock: p.stock, category_id: p.category_id, images: p.images, active: p.active } });
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener producto' });
        }
    },

    createProduct: async (req, res) => {
        try {
            const created = await Product.create({ name: req.body.name, description: req.body.description, price: req.body.price, old_price: req.body.old_price, category_id: req.body.category_id, stock: req.body.stock, images: req.body.images || [], active: req.body.active !== false });
            res.json({ success: true, message: 'Producto creado correctamente', data: { id: created.id_product, name: created.name, description: created.description, price: parseFloat(created.price), stock: created.stock, category_id: created.category_id, images: created.images, active: created.active } });
        } catch (error) {
            res.status(500).json({ error: 'Error al crear producto' });
        }
    },

    updateProduct: async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            await Product.update({ name: req.body.name, description: req.body.description, price: req.body.price, old_price: req.body.old_price, category_id: req.body.category_id, stock: req.body.stock, images: req.body.images, active: req.body.active }, { where: { id_product: id } });
            const updated = await Product.findByPk(id);
            if (!updated) return res.status(404).json({ error: 'Producto no encontrado' });
            res.json({ success: true, message: 'Producto actualizado correctamente', data: { id: updated.id_product, name: updated.name, description: updated.description, price: parseFloat(updated.price), stock: updated.stock, category_id: updated.category_id, images: updated.images, active: updated.active } });
        } catch (error) {
            res.status(500).json({ error: 'Error al actualizar producto' });
        }
    },

    deleteProduct: async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const count = await Product.destroy({ where: { id_product: id } });
            if (!count) return res.status(404).json({ error: 'Producto no encontrado' });
            res.json({ success: true, message: 'Producto eliminado correctamente' });
        } catch (error) {
            res.status(500).json({ error: 'Error al eliminar producto' });
        }
    },

    getAllOrders: async (req, res) => {
        try {
            const { status, paymentStatus } = req.query;
            const where = {};
            if (status) where.status = status;
            if (paymentStatus) where.payment_status = paymentStatus;
            const orders = await Order.findAll({ where, order: [['created_at', 'DESC']] });
            res.json({ success: true, data: orders });
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener pedidos' });
        }
    },

    getOrder: async (req, res) => {
        try {
            const { OrderItem } = require('../models/OrderSequelize');
            const order = await Order.findByPk(req.params.id);
            if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });
            const items = await OrderItem.findAll({ where: { order_id: order.id_order } });
            res.json({ success: true, data: { ...order.toJSON(), items } });
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener pedido' });
        }
    },

    updateOrderStatus: async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const { status, trackingNumber, notes } = req.body;
            await Order.update({ status, tracking_number: trackingNumber, notes }, { where: { id_order: id } });
            const updated = await Order.findByPk(id);
            if (!updated) return res.status(404).json({ error: 'Pedido no encontrado' });
            res.json({ success: true, message: 'Pedido actualizado correctamente', data: updated });
        } catch (error) {
            res.status(500).json({ error: 'Error al actualizar pedido' });
        }
    },

    getAllUsers: async (req, res) => {
        try {
            const { role, active } = req.query;
            const where = {};
            if (role) where.role = role;
            if (active !== undefined) where.active = active === 'true';
            const list = await User.findAll({ where });
            res.json({ success: true, data: list.map(u => ({ id: u.id_user, email: u.email, firstName: u.first_name, lastName: u.last_name, role: u.role, active: u.active, phone: u.phone })) });
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener usuarios' });
        }
    },

    getUser: async (req, res) => {
        try {
            const u = await User.findByPk(req.params.id);
            if (!u) return res.status(404).json({ error: 'Usuario no encontrado' });
            res.json({ success: true, data: { id: u.id_user, email: u.email, firstName: u.first_name, lastName: u.last_name, role: u.role, active: u.active, phone: u.phone } });
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener usuario' });
        }
    },

    updateUser: async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            await User.update({ first_name: req.body.firstName, last_name: req.body.lastName, phone: req.body.phone, role: req.body.role, active: req.body.active }, { where: { id_user: id } });
            const updated = await User.findByPk(id);
            if (!updated) return res.status(404).json({ error: 'Usuario no encontrado' });
            res.json({ success: true, message: 'Usuario actualizado correctamente', data: { id: updated.id_user, email: updated.email, firstName: updated.first_name, lastName: updated.last_name, role: updated.role, active: updated.active, phone: updated.phone } });
        } catch (error) {
            res.status(500).json({ error: 'Error al actualizar usuario' });
        }
    },

    getAllPromotions: async (_req, res) => {
        try {
            const list = await Promotion.findAll();
            const links = await PromotionProduct.findAll();
            const linkMap = new Map();
            for (const l of links) {
                const arr = linkMap.get(l.promotion_id) || [];
                arr.push(l.product_id);
                linkMap.set(l.promotion_id, arr);
            }
            res.json({ success: true, data: list.map(p => ({ id: p.id_promotion, name: p.name, type: p.type, value: parseFloat(p.value), startAt: p.start_at, endAt: p.end_at, active: p.active, products: linkMap.get(p.id_promotion) || [] })) });
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener promociones' });
        }
    },

    getPromotion: async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const p = await Promotion.findByPk(id);
            if (!p) return res.status(404).json({ error: 'Promoción no encontrada' });
            const links = await PromotionProduct.findAll({ where: { promotion_id: id } });
            res.json({ success: true, data: { id: p.id_promotion, name: p.name, type: p.type, value: parseFloat(p.value), startAt: p.start_at, endAt: p.end_at, active: p.active, products: links.map(l => l.product_id) } });
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener promoción' });
        }
    },

    createPromotion: async (req, res) => {
        try {
            const { name, type, value, startAt, endAt, active = true, productIds = [] } = req.body;
            const created = await Promotion.create({ name, type, value, start_at: new Date(startAt), end_at: new Date(endAt), active });
            if (Array.isArray(productIds) && productIds.length) {
                await PromotionProduct.bulkCreate(productIds.map(pid => ({ promotion_id: created.id_promotion, product_id: pid })));
            }
            res.status(201).json({ success: true, message: 'Promoción creada', data: { id: created.id_promotion } });
        } catch (error) {
            res.status(500).json({ error: 'Error al crear promoción' });
        }
    },

    updatePromotion: async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const { name, type, value, startAt, endAt, active, productIds } = req.body;
            const [count] = await Promotion.update({ name, type, value, start_at: startAt ? new Date(startAt) : undefined, end_at: endAt ? new Date(endAt) : undefined, active }, { where: { id_promotion: id } });
            if (!count) return res.status(404).json({ error: 'Promoción no encontrada' });
            if (Array.isArray(productIds)) {
                await PromotionProduct.destroy({ where: { promotion_id: id } });
                if (productIds.length) {
                    await PromotionProduct.bulkCreate(productIds.map(pid => ({ promotion_id: id, product_id: pid })));
                }
            }
            const p = await Promotion.findByPk(id);
            const links = await PromotionProduct.findAll({ where: { promotion_id: id } });
            res.json({ success: true, message: 'Promoción actualizada', data: { id: p.id_promotion, name: p.name, type: p.type, value: parseFloat(p.value), startAt: p.start_at, endAt: p.end_at, active: p.active, products: links.map(l => l.product_id) } });
        } catch (error) {
            res.status(500).json({ error: 'Error al actualizar promoción' });
        }
    },

    deletePromotion: async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            await PromotionProduct.destroy({ where: { promotion_id: id } });
            const count = await Promotion.destroy({ where: { id_promotion: id } });
            if (!count) return res.status(404).json({ error: 'Promoción no encontrada' });
            res.json({ success: true, message: 'Promoción eliminada' });
        } catch (error) {
            res.status(500).json({ error: 'Error al eliminar promoción' });
        }
    }
};

module.exports = adminController;
