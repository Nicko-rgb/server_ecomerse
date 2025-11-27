// Modelo de Categoría
// Este modelo define la estructura de la tabla 'categories' en la base de datos.
// Almacena información sobre las categorías disponibles para los productos.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Categories = sequelize.define('Categories', {
    id_category: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: 'categories',
    timestamps: false
});

module.exports = Categories;