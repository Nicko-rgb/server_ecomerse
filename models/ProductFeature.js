const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ProductFeature = sequelize.define('ProductFeature', {
    id_product_feature: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    value: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'product_features',
    timestamps: false
});

module.exports = ProductFeature;
