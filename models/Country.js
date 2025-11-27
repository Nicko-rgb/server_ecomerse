// Modelo de País
// Este modelo define la estructura de la tabla 'countries' en la base de datos.
// Almacena información sobre los países disponibles para la tienda.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Country = sequelize.define('Country', {
    id_country: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    currency_code: {
        type: DataTypes.STRING,
        allowNull: false
    },
    currency_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    currency_symbol: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'countries',
    timestamps: false
});

module.exports = Country;

