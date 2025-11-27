const { Sequelize } = require('sequelize');

const url = process.env.URL_DATABASE;
const host = process.env.DB_HOST;
const port = process.env.DB_PORT;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD || '';
const name = process.env.DB_NAME;

const sequelize = url
    ? new Sequelize(url, { dialect: 'postgres', logging: false })
    : new Sequelize(name, user, password, { host, port, dialect: 'postgres', logging: false });

module.exports = sequelize;
