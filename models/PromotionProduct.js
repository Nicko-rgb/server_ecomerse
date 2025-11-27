const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PromotionProduct = sequelize.define('PromotionProduct', {
    id_promotion_product: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    promotion_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'promotion_products',
    timestamps: false
});

module.exports = PromotionProduct;

