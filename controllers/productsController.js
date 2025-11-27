const Product = require('../models/Product');
const Categories = require('../models/Categories');
const sequelize = require('../config/db');
const ProductFeature = require('../models/ProductFeature');
const Promotion = require('../models/Promotion');
const PromotionProduct = require('../models/PromotionProduct');

const mapProduct = (p, catName) => ({
    id: p.id_product,
    name: p.name,
    description: p.description,
    price: parseFloat(p.price),
    old_price: p.old_price != null ? parseFloat(p.old_price) : null,
    category: catName || null,
    stock: p.stock,
    images: Array.isArray(p.images) ? p.images : [],
    active: p.active,
});

const productsController = {
    getAllProducts: async (req, res) => {
        try {
            const { category, search, minPrice, maxPrice, page = 1, limit = 10, random } = req.query;
            const where = { active: true };
            let categoryId;
            if (category) {
                const cat = await Categories.findOne({ where: { name: category } });
                if (cat) categoryId = cat.id_category;
            }
            if (categoryId) where.category_id = categoryId;
            if (minPrice) where.price = { ...(where.price || {}), [sequelize.Sequelize.Op.gte]: parseFloat(minPrice) };
            if (maxPrice) where.price = { ...(where.price || {}), [sequelize.Sequelize.Op.lte]: parseFloat(maxPrice) };
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
            const order = random === 'true' ? sequelize.Sequelize.literal('RANDOM()') : [['id_product', 'DESC']];
            const products = await Product.findAll({ where, order, limit: limitNum, offset });

            const categories = await Categories.findAll();
            const catMap = new Map(categories.map(c => [c.id_category, c.name]));
            const ids = products.map(p => p.id_product);
            const now = new Date();
            const promos = await PromotionProduct.findAll({
                where: { product_id: ids.length ? ids : [-1] },
                include: [{ model: Promotion, where: { active: true, start_at: { [sequelize.Sequelize.Op.lte]: now }, end_at: { [sequelize.Sequelize.Op.gte]: now } } }]
            });
            const promoMap = new Map();
            for (const pp of promos) {
                const value = parseFloat(pp.Promotion.value);
                const type = pp.Promotion.type;
                const current = promoMap.get(pp.product_id);
                const score = type === 'percentage' ? value : value;
                if (!current || score > current.score) {
                    promoMap.set(pp.product_id, { type, value, score });
                }
            }
            const list = products.map(p => {
                const base = mapProduct(p, catMap.get(p.category_id));
                const promo = promoMap.get(p.id_product);
                if (promo) {
                    const price = promo.type === 'percentage' ? base.price * (1 - promo.value / 100) : Math.max(0, base.price - promo.value);
                    return { ...base, price: parseFloat(price.toFixed(2)) };
                }
                return base;
            });

            res.json({ success: true, data: list, total, page: pageNum, limit: limitNum, hasMore: offset + list.length < total });
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener productos' });
        }
    },

    getProductById: async (req, res) => {
        try {
            const p = await Product.findByPk(req.params.id);
            if (!p || !p.active) {
                res.status(404).json({ error: 'Producto no encontrado' });
                return;
            }
            const cat = await Categories.findByPk(p.category_id);
            const now = new Date();
            const promoRow = await PromotionProduct.findOne({
                where: { product_id: p.id_product },
                include: [{ model: Promotion, where: { active: true, start_at: { [sequelize.Sequelize.Op.lte]: now }, end_at: { [sequelize.Sequelize.Op.gte]: now } } }]
            });
            let out = mapProduct(p, cat ? cat.name : null);
            const features = await ProductFeature.findAll({ where: { product_id: p.id_product } });
            out = { ...out, features: features.map(f => ({ name: f.name, value: f.value })) };
            if (promoRow) {
                const promo = promoRow.Promotion;
                const adjusted = promo.type === 'percentage' ? out.price * (1 - parseFloat(promo.value) / 100) : Math.max(0, out.price - parseFloat(promo.value));
                out = { ...out, price: parseFloat(adjusted.toFixed(2)) };
            }
            res.json({ success: true, data: out });
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener producto' });
        }
    },

    getFeaturedProducts: async (req, res) => {
        try {
            const limit = Math.max(parseInt(req.query.limit) || 10, 1);
            const products = await Product.findAll({ where: { active: true, is_featured: true }, order: sequelize.Sequelize.literal('RANDOM()'), limit });
            const categories = await Categories.findAll();
            const catMap = new Map(categories.map(c => [c.id_category, c.name]));
            res.json({ success: true, data: products.map(p => mapProduct(p, catMap.get(p.category_id))) });
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener productos destacados' });
        }
    },

    getCategories: async (_req, res) => {
        try {
            const cats = await Categories.findAll();
            const data = await Promise.all(
                cats.map(async c => ({ name: c.name, count: await Product.count({ where: { category_id: c.id_category, active: true } }) }))
            );
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener categorías' });
        }
    },

    getRelatedProducts: async (req, res) => {
        try {
            const base = await Product.findByPk(req.params.id);
            if (!base) {
                res.status(404).json({ error: 'Producto no encontrado' });
                return;
            }
            const excludeRaw = String(req.query.exclude || '').trim();
            const excludeIds = excludeRaw ? excludeRaw.split(',').map(v => parseInt(v)).filter(n => !isNaN(n)) : [];
            const where = { category_id: base.category_id, active: true, id_product: { [sequelize.Sequelize.Op.ne]: base.id_product } };
            if (excludeIds.length) where.id_product[sequelize.Sequelize.Op.notIn] = excludeIds;
            const products = await Product.findAll({ where, order: sequelize.Sequelize.literal('RANDOM()'), limit: 6 });
            const categories = await Categories.findAll();
            const catMap = new Map(categories.map(c => [c.id_category, c.name]));
            const related = products.map(p => mapProduct(p, catMap.get(p.category_id)));
            res.json({ success: true, data: related });
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener productos relacionados' });
        }
    }
};

module.exports = productsController;
