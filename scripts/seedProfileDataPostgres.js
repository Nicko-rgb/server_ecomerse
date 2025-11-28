require('dotenv').config();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const DataUser = require('../models/DataUser');
const { Order, OrderItem } = require('../models/OrderSequelize');
const Product = require('../models/Product');
const { Sequelize } = require('sequelize');

// Configuración directa para evitar problemas
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  String(process.env.DB_PASSWORD),
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    dialect: 'postgres',
    logging: false
  }
);

const seedProfileData = async () => {
  try {
    console.log('🌱 Iniciando seeder de datos de perfil para PostgreSQL...');

    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conectado a PostgreSQL');

    // Buscar o crear usuario de prueba
    let user = await User.findOne({ where: { email: 'usuario@ejemplo.com' } });
    
    if (!user) {
      console.log('❌ Usuario de prueba no encontrado. Creando...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      user = await User.create({
        email: 'usuario@ejemplo.com',
        password: hashedPassword,
        first_name: 'Juan',
        last_name: 'Pérez',
        phone: '+52 55 1234 5678',
        role: 'user',
        date_of_birth: '1990-05-15',
        gender: 'male'
      });
      console.log('✅ Usuario de prueba creado');
    }

    // Buscar o crear datos adicionales del usuario
    let dataUser = await DataUser.findOne({ where: { user_id: user.id_user } });
    
    // Datos de ejemplo para direcciones
    const sampleAddresses = [
      {
        id: 1,
        type: 'home',
        fullAddress: 'Av. Insurgentes Sur 1234, Col. Del Valle, Ciudad de México, CDMX 03100',
        reference: 'Casa azul con portón negro, timbre azul',
        isPrimary: true,
        createdAt: new Date('2024-01-01T10:00:00Z')
      },
      {
        id: 2,
        type: 'work',
        fullAddress: 'Av. Reforma 456, Col. Juárez, Ciudad de México, CDMX 06600',
        reference: 'Torre corporativa, piso 15, oficina 1502',
        isPrimary: false,
        createdAt: new Date('2024-01-15T14:30:00Z')
      },
      {
        id: 3,
        type: 'other',
        fullAddress: 'Calle Madero 789, Centro Histórico, Ciudad de México, CDMX 06000',
        reference: 'Edificio colonial, departamento 3B',
        isPrimary: false,
        createdAt: new Date('2024-02-01T09:15:00Z')
      }
    ];

    // Datos de ejemplo para métodos de pago
    const samplePaymentMethods = [
      {
        id: 1,
        type: 'credit_card',
        title: 'Visa Principal',
        cardNumber: '**** **** **** 1234',
        cardHolder: 'JUAN PEREZ',
        expiryDate: '12/26',
        isPrimary: true,
        createdAt: new Date('2024-01-01T10:00:00Z')
      },
      {
        id: 2,
        type: 'debit_card',
        title: 'Mastercard Débito',
        cardNumber: '**** **** **** 5678',
        cardHolder: 'JUAN PEREZ',
        expiryDate: '08/27',
        isPrimary: false,
        createdAt: new Date('2024-01-10T16:20:00Z')
      },
      {
        id: 3,
        type: 'paypal',
        title: 'PayPal Personal',
        cardNumber: 'juan.perez@ejemplo.com',
        cardHolder: 'Juan Pérez',
        expiryDate: '',
        isPrimary: false,
        createdAt: new Date('2024-01-20T11:45:00Z')
      }
    ];
    
    if (!dataUser) {
      dataUser = await DataUser.create({
        user_id: user.id_user,
        address: 'Av. Insurgentes Sur 1234, Col. Del Valle',
        city: 'Ciudad de México',
        postal_code: '03100',
        country: 'México',
        addresses: sampleAddresses,
        payment_methods: samplePaymentMethods,
        preferred_payment_method_id: 1
      });
      console.log('✅ Datos adicionales del usuario creados con direcciones y métodos de pago');
    } else {
      // Actualizar datos existentes
      await dataUser.update({
        address: 'Av. Insurgentes Sur 1234, Col. Del Valle',
        city: 'Ciudad de México',
        postal_code: '03100',
        country: 'México',
        addresses: sampleAddresses,
        payment_methods: samplePaymentMethods,
        preferred_payment_method_id: 1
      });
      console.log('✅ Datos adicionales del usuario actualizados con direcciones y métodos de pago');
    }

    // Eliminar pedidos existentes del usuario
    const existingOrders = await Order.findAll({ where: { user_id: user.id_user } });
    for (const order of existingOrders) {
      await OrderItem.destroy({ where: { order_id: order.id_order } });
      await order.destroy();
    }
    console.log('✅ Pedidos anteriores eliminados');

    // Crear pedidos reales
    const orders = [
      {
        user_id: user.id_user,
        total: 1329.98,
        status: 'delivered',
        payment_status: 'paid',
        tracking_number: 'TRK789456123',
        notes: 'Entregado en casa azul con portón negro',
        created_at: new Date('2024-01-20T10:30:00Z'),
        items: [
          {
            name: 'iPhone 15 Pro Max 256GB',
            image: 'https://triplex.com.bo/wp-content/uploads/2024/01/15-pro-max.jpg',
            quantity: 1,
            price: 1299.99
          },
          {
            name: 'Funda iPhone 15 Pro Max',
            image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=300',
            quantity: 1,
            price: 29.99
          }
        ]
      },
      {
        user_id: user.id_user,
        total: 1329.97,
        status: 'shipped',
        payment_status: 'paid',
        tracking_number: 'TRK456789012',
        notes: 'En tránsito - FedEx',
        created_at: new Date('2024-01-15T14:20:00Z'),
        items: [
          {
            name: 'MacBook Air M2 13" 256GB',
            image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300',
            quantity: 1,
            price: 1199.99
          },
          {
            name: 'Magic Mouse',
            image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300',
            quantity: 1,
            price: 79.99
          },
          {
            name: 'USB-C Hub 7 en 1',
            image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=300',
            quantity: 1,
            price: 49.99
          }
        ]
      },
      {
        user_id: user.id_user,
        total: 249.99,
        status: 'processing',
        payment_status: 'paid',
        tracking_number: 'TRK123456789',
        notes: 'Preparando envío',
        created_at: new Date('2024-01-10T09:15:00Z'),
        items: [
          {
            name: 'AirPods Pro 2da Gen',
            image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=300',
            quantity: 1,
            price: 249.99
          }
        ]
      },
      {
        user_id: user.id_user,
        total: 229.97,
        status: 'cancelled',
        payment_status: 'refunded',
        tracking_number: 'TRK987654321',
        notes: 'Cancelado por el cliente - Reembolso procesado',
        created_at: new Date('2024-01-05T16:45:00Z'),
        items: [
          {
            name: 'Camiseta Nike Dri-FIT',
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300',
            quantity: 2,
            price: 29.99
          },
          {
            name: 'Shorts Nike Running',
            image: 'https://images.unsplash.com/photo-1506629905607-d9f02a6a0f7b?w=300',
            quantity: 1,
            price: 39.99
          },
          {
            name: 'Tenis Nike Air Max',
            image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300',
            quantity: 1,
            price: 129.99
          }
        ]
      },
      {
        user_id: user.id_user,
        total: 489.98,
        status: 'pending',
        payment_status: 'pending',
        tracking_number: 'TRK555666777',
        notes: 'Esperando confirmación de pago',
        created_at: new Date('2024-01-25T11:00:00Z'),
        items: [
          {
            name: 'Monitor LG 27" 4K',
            image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300',
            quantity: 1,
            price: 399.99
          },
          {
            name: 'Teclado Mecánico RGB',
            image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=300',
            quantity: 1,
            price: 89.99
          }
        ]
      }
    ];

    // Insertar pedidos y sus items
    for (const orderData of orders) {
      const { items, ...orderInfo } = orderData;
      
      const order = await Order.create(orderInfo);
      
      for (const item of items) {
        await OrderItem.create({
          order_id: order.id_order,
          name: item.name,
          image: item.image,
          quantity: item.quantity,
          price: item.price
        });
      }
    }
    console.log('✅ Pedidos reales creados');

    // Crear datos para usuario admin también
    let adminUser = await User.findOne({ where: { email: 'admin@ejemplo.com' } });
    
    if (!adminUser) {
      console.log('❌ Usuario admin no encontrado. Creando...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      adminUser = await User.create({
        email: 'admin@ejemplo.com',
        password: hashedPassword,
        first_name: 'María',
        last_name: 'González',
        phone: '+52 55 9876 5432',
        role: 'admin',
        date_of_birth: '1985-08-22',
        gender: 'female'
      });
      console.log('✅ Usuario admin creado');
    }

    // Datos adicionales del admin
    let adminDataUser = await DataUser.findOne({ where: { user_id: adminUser.id_user } });
    
    // Datos de ejemplo para el admin
    const adminAddresses = [
      {
        id: 1,
        type: 'home',
        fullAddress: 'Av. Polanco 567, Col. Polanco, Ciudad de México, CDMX 11560',
        reference: 'Residencial Las Lomas, casa 15',
        isPrimary: true,
        createdAt: new Date('2024-01-01T10:00:00Z')
      },
      {
        id: 2,
        type: 'work',
        fullAddress: 'Av. Santa Fe 1234, Col. Santa Fe, Ciudad de México, CDMX 01210',
        reference: 'Torre Ejecutiva, piso 25, oficina principal',
        isPrimary: false,
        createdAt: new Date('2024-01-05T12:00:00Z')
      }
    ];

    const adminPaymentMethods = [
      {
        id: 1,
        type: 'credit_card',
        title: 'American Express Platinum',
        cardNumber: '**** **** **** 9876',
        cardHolder: 'MARIA GONZALEZ',
        expiryDate: '03/28',
        isPrimary: true,
        createdAt: new Date('2024-01-01T10:00:00Z')
      },
      {
        id: 2,
        type: 'credit_card',
        title: 'Visa Gold',
        cardNumber: '**** **** **** 4321',
        cardHolder: 'MARIA GONZALEZ',
        expiryDate: '11/27',
        isPrimary: false,
        createdAt: new Date('2024-01-08T14:30:00Z')
      }
    ];
    
    if (!adminDataUser) {
      adminDataUser = await DataUser.create({
        user_id: adminUser.id_user,
        address: 'Av. Polanco 567, Col. Polanco',
        city: 'Ciudad de México',
        postal_code: '11560',
        country: 'México',
        addresses: adminAddresses,
        payment_methods: adminPaymentMethods,
        preferred_payment_method_id: 1
      });
      console.log('✅ Datos del admin creados con direcciones y métodos de pago');
    } else {
      await adminDataUser.update({
        address: 'Av. Polanco 567, Col. Polanco',
        city: 'Ciudad de México',
        postal_code: '11560',
        country: 'México',
        addresses: adminAddresses,
        payment_methods: adminPaymentMethods,
        preferred_payment_method_id: 1
      });
      console.log('✅ Datos del admin actualizados con direcciones y métodos de pago');
    }

    console.log('\n🎉 ¡Seeder completado exitosamente!');
    console.log('\n📊 Datos creados:');
    console.log(`👤 Usuario: ${user.first_name} ${user.last_name} (ID: ${user.id_user})`);
    console.log(`📍 Dirección principal: ${dataUser.address}, ${dataUser.city}`);
    console.log(`🏠 Direcciones guardadas: ${sampleAddresses.length}`);
    console.log(`💳 Métodos de pago: ${samplePaymentMethods.length}`);
    console.log(`📦 Pedidos: ${orders.length}`);
    console.log(`👩‍💼 Admin: ${adminUser.first_name} ${adminUser.last_name} (ID: ${adminUser.id_user})`);
    console.log(`🏢 Direcciones admin: ${adminAddresses.length}`);
    console.log(`💼 Métodos de pago admin: ${adminPaymentMethods.length}`);
    console.log('\n🧪 Credenciales de prueba:');
    console.log('📧 Cliente: usuario@ejemplo.com / password123');
    console.log('📧 Admin: admin@ejemplo.com / admin123');
    console.log('\n✨ Funcionalidades disponibles:');
    console.log('• ✅ Gestión completa de direcciones (agregar, editar, eliminar)');
    console.log('• ✅ Gestión completa de métodos de pago (agregar, editar, eliminar)');
    console.log('• ✅ Historial de pedidos con imágenes de productos');
    console.log('• ✅ Detalles completos de pedidos');
    console.log('• ✅ Estados de pedidos: entregado, enviado, procesando, pendiente, cancelado');

  } catch (error) {
    console.error('❌ Error en el seeder:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión cerrada');
  }
};

// Exportar función para uso en server.js
module.exports = { seedProfileData };

// Ejecutar seeder solo si se llama directamente
if (require.main === module) {
  seedProfileData();
}