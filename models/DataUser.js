// Modelo de Datos de Usuario
// Este modelo define la estructura de la tabla 'data_users' en la base de datos.
// Almacena información adicional sobre los usuarios, como dirección, ciudad, código postal, país y método de pago preferido.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DataUser = sequelize.define('DataUser', {
    id_data_user: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    city: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    postal_code: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    country: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    preferred_payment_method_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    addresses: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    payment_methods: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    }
}, {
    tableName: 'data_users',
    timestamps: false
});

module.exports = DataUser;
