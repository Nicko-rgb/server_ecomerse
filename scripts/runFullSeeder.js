#!/usr/bin/env node

/**
 * Script para ejecutar el seeder completo del sistema
 * Incluye productos, categorías, usuarios y datos de perfil
 */

require('dotenv').config();
const chalk = require('chalk');

async function runFullSeeder() {
  console.log(chalk.bgBlue.white(' 🌱 INICIANDO SEEDER COMPLETO DEL SISTEMA '));
  console.log('');

  try {
    // 1. Ejecutar seeder principal (productos, categorías, etc.)
    console.log(chalk.blue('📦 Paso 1: Ejecutando seeder principal...'));
    const { seedInitialData } = require('../config/seed');
    await seedInitialData();
    console.log(chalk.green('✅ Seeder principal completado'));
    console.log('');

    // 2. Ejecutar seeder de perfil (usuarios, direcciones, pedidos)
    console.log(chalk.blue('👤 Paso 2: Ejecutando seeder de perfil...'));
    const { seedProfileData } = require('./seedProfileDataPostgres');
    await seedProfileData();
    console.log(chalk.green('✅ Seeder de perfil completado'));
    console.log('');

    // 3. Resumen final
    console.log(chalk.bgGreen.white(' 🎉 SEEDER COMPLETO FINALIZADO EXITOSAMENTE '));
    console.log('');
    console.log(chalk.yellow('📋 RESUMEN DE DATOS CREADOS:'));
    console.log('');
    console.log('🛍️  Productos y categorías de ejemplo');
    console.log('🌍  Países y métodos de pago');
    console.log('🎯  Promociones de ejemplo');
    console.log('👤  Usuarios de prueba (cliente y admin)');
    console.log('🏠  Direcciones de ejemplo');
    console.log('💳  Métodos de pago de ejemplo');
    console.log('📦  Pedidos con diferentes estados');
    console.log('🖼️  Imágenes de productos en pedidos');
    console.log('');
    console.log(chalk.cyan('🔑 CREDENCIALES DE ACCESO:'));
    console.log('');
    console.log('👤 Cliente:');
    console.log('   📧 Email: usuario@ejemplo.com');
    console.log('   🔒 Password: password123');
    console.log('');
    console.log('👩‍💼 Administrador:');
    console.log('   📧 Email: admin@ejemplo.com');
    console.log('   🔒 Password: admin123');
    console.log('');
    console.log(chalk.magenta('🚀 El sistema está listo para usar!'));
    console.log('');

  } catch (error) {
    console.error(chalk.red('❌ Error durante el seeder:'), error.message);
    console.error(chalk.red('📍 Stack trace:'), error.stack);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runFullSeeder()
    .then(() => {
      console.log(chalk.green('🏁 Proceso completado'));
      process.exit(0);
    })
    .catch((error) => {
      console.error(chalk.red('💥 Error fatal:'), error);
      process.exit(1);
    });
}

module.exports = { runFullSeeder };