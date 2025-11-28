// Index.js
// Este archivo exporta todos los modelos y funciones relacionadas con la base de datos.
// Incluye la inicialización de asociaciones y la sincronización de modelos.
const sequelize = require('../config/db');
const User = require('./User');
const DataUser = require('./DataUser');
const Product = require('./Product');
const Categories = require('./Categories');
const PaymentMethod = require('./PaymentMethod');
const { Order, OrderItem } = require('./OrderSequelize');
const Country = require('./Country');
const Promotion = require('./Promotion');
const PromotionProduct = require('./PromotionProduct');
const ProductFeature = require('./ProductFeature');

let associated = false;

const initAssociations = () => {
    if (associated) return;
    User.hasOne(DataUser, { foreignKey: 'user_id' });
    DataUser.belongsTo(User, { foreignKey: 'user_id' });
    DataUser.belongsTo(PaymentMethod, { foreignKey: 'preferred_payment_method_id', as: 'preferredPaymentMethod' });
    Categories.hasMany(Product, { foreignKey: 'category_id' });
    Product.belongsTo(Categories, { foreignKey: 'category_id' });
    User.hasMany(Order, { foreignKey: 'user_id' });
    Order.belongsTo(User, { foreignKey: 'user_id' });
    Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
    OrderItem.belongsTo(Order, { foreignKey: 'order_id' });
    Promotion.hasMany(PromotionProduct, { foreignKey: 'promotion_id' });
    PromotionProduct.belongsTo(Promotion, { foreignKey: 'promotion_id' });
    Product.hasMany(PromotionProduct, { foreignKey: 'product_id' });
    PromotionProduct.belongsTo(Product, { foreignKey: 'product_id' });
    Product.hasMany(ProductFeature, { foreignKey: 'product_id' });
    ProductFeature.belongsTo(Product, { foreignKey: 'product_id' });
    associated = true;
};

const syncModels = () => {
    const force = String(process.env.DB_FORCE_SYNC || '').toLowerCase() === 'true';
    const alter = String(process.env.DB_ALTER_SYNC || '').toLowerCase() === 'true';
    console.log(`DB Sync options: force=${force} alter=${alter}`);
    return sequelize.sync({ force, alter });
};

module.exports = {
    sequelize,
    initAssociations,
    syncModels,
    models: { User, DataUser, Product, Categories, PaymentMethod, Order, OrderItem, Country, Promotion, PromotionProduct, ProductFeature }
};
