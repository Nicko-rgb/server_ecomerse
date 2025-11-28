const { Sequelize } = require('sequelize');

const url = process.env.URL_DATABASE;
const host = process.env.DB_HOST;
const port = process.env.DB_PORT;
const user = process.env.DB_USER;
const password = String(process.env.DB_PASSWORD || '');
const name = process.env.DB_NAME;

// Usar siempre configuración individual para evitar problemas con contraseñas numéricas
const sequelize = new Sequelize(name, user, password, { 
    host, 
    port: parseInt(port), 
    dialect: 'postgres', 
    logging: false 
});

module.exports = sequelize;
