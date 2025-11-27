// Modelo de Método de Pago
// Este modelo define la estructura de la tabla 'payment_methods' en la base de datos.
// Almacena información sobre los métodos de pago disponibles para los usuarios.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PaymentMethod = sequelize.define('PaymentMethod', {
    id_payment_method: {
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
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    tableName: 'payment_methods',
    timestamps: false
});

module.exports = PaymentMethod;
