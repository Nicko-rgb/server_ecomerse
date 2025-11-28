require('dotenv').config();
const sequelize = require('../config/db');

const testConnection = async () => {
  try {
    console.log('🔍 Probando conexión a PostgreSQL...');
    console.log('📊 Configuración:');
    console.log(`   Host: ${process.env.DB_HOST}`);
    console.log(`   Port: ${process.env.DB_PORT}`);
    console.log(`   User: ${process.env.DB_USER}`);
    console.log(`   Database: ${process.env.DB_NAME}`);
    console.log(`   Password: ${process.env.DB_PASSWORD ? '***' : 'NO CONFIGURADA'}`);
    
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a PostgreSQL');
    
    // Probar una consulta simple
    const [results] = await sequelize.query('SELECT version()');
    console.log('📋 Versión de PostgreSQL:', results[0].version);
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.log('\n🔧 Posibles soluciones:');
    console.log('1. Verificar que PostgreSQL esté corriendo');
    console.log('2. Verificar credenciales en .env');
    console.log('3. Verificar que la base de datos "ecomerse" exista');
    console.log('4. Verificar permisos del usuario');
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión cerrada');
  }
};

testConnection();