const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

// Esquemas simplificados para el seeder
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  phone: String,
  role: String,
  addresses: [{
    type: String,
    fullAddress: String,
    reference: String,
    isPrimary: Boolean,
    createdAt: { type: Date, default: Date.now }
  }],
  paymentMethods: [{
    type: String,
    title: String,
    cardNumber: String,
    cardHolder: String,
    expiryDate: String,
    isPrimary: Boolean,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{
    product: {
      name: String,
      image: String,
      price: Number
    },
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  status: String,
  shippingAddress: {
    fullAddress: String,
    reference: String
  },
  paymentMethod: {
    type: String,
    title: String
  },
  tracking: {
    number: String,
    carrier: String,
    status: String
  },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Order = mongoose.model('Order', orderSchema);

const seedProfileData = async () => {
  try {
    console.log('🌱 Iniciando seeder de datos de perfil...');

    // Buscar usuario de prueba
    let user = await User.findOne({ email: 'usuario@ejemplo.com' });
    
    if (!user) {
      console.log('❌ Usuario de prueba no encontrado. Creando...');
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      user = new User({
        email: 'usuario@ejemplo.com',
        password: hashedPassword,
        firstName: 'Juan',
        lastName: 'Pérez',
        phone: '+52 55 1234 5678',
        role: 'user'
      });
      await user.save();
      console.log('✅ Usuario de prueba creado');
    }

    // Agregar direcciones reales
    user.addresses = [
      {
        type: 'home',
        fullAddress: 'Av. Insurgentes Sur 1234, Col. Del Valle, Ciudad de México, CDMX, México, CP 03100',
        reference: 'Casa azul con portón negro, entre farmacia Guadalajara y Oxxo',
        isPrimary: true
      },
      {
        type: 'work',
        fullAddress: 'Av. Reforma 456, Col. Juárez, Ciudad de México, CDMX, México, CP 06600',
        reference: 'Torre corporativa, piso 15, oficina 1502',
        isPrimary: false
      },
      {
        type: 'other',
        fullAddress: 'Calle Madero 789, Centro Histórico, Ciudad de México, CDMX, México, CP 06000',
        reference: 'Casa de mis padres, timbre color rojo',
        isPrimary: false
      }
    ];

    // Agregar métodos de pago reales
    user.paymentMethods = [
      {
        type: 'credit_card',
        title: '💳 Tarjeta de Crédito Visa',
        cardNumber: '**** **** **** 1234',
        cardHolder: 'Juan Pérez',
        expiryDate: '12/26',
        isPrimary: true
      },
      {
        type: 'paypal',
        title: '🅿️ PayPal',
        cardNumber: 'juan.perez@email.com',
        cardHolder: 'Juan Pérez',
        isPrimary: false
      },
      {
        type: 'debit_card',
        title: '💳 Tarjeta de Débito Mastercard',
        cardNumber: '**** **** **** 5678',
        cardHolder: 'Juan Pérez',
        expiryDate: '08/25',
        isPrimary: false
      }
    ];

    await user.save();
    console.log('✅ Direcciones y métodos de pago agregados al usuario');

    // Eliminar pedidos existentes del usuario
    await Order.deleteMany({ user: user._id });

    // Crear pedidos reales
    const orders = [
      {
        user: user._id,
        items: [
          {
            product: {
              name: 'iPhone 15 Pro Max 256GB',
              image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300',
              price: 1299.99
            },
            quantity: 1,
            price: 1299.99
          },
          {
            product: {
              name: 'Funda iPhone 15 Pro Max',
              image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=300',
              price: 29.99
            },
            quantity: 1,
            price: 29.99
          }
        ],
        totalAmount: 1329.98,
        status: 'delivered',
        shippingAddress: {
          fullAddress: 'Av. Insurgentes Sur 1234, Col. Del Valle, Ciudad de México, CDMX',
          reference: 'Casa azul con portón negro'
        },
        paymentMethod: {
          type: 'credit_card',
          title: 'Visa **** 1234'
        },
        tracking: {
          number: 'TRK789456123',
          carrier: 'DHL Express',
          status: 'delivered'
        },
        createdAt: new Date('2024-01-20T10:30:00Z')
      },
      {
        user: user._id,
        items: [
          {
            product: {
              name: 'MacBook Air M2 13" 256GB',
              image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300',
              price: 1199.99
            },
            quantity: 1,
            price: 1199.99
          },
          {
            product: {
              name: 'Magic Mouse',
              image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300',
              price: 79.99
            },
            quantity: 1,
            price: 79.99
          },
          {
            product: {
              name: 'USB-C Hub 7 en 1',
              image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=300',
              price: 49.99
            },
            quantity: 1,
            price: 49.99
          }
        ],
        totalAmount: 1329.97,
        status: 'shipped',
        shippingAddress: {
          fullAddress: 'Av. Reforma 456, Col. Juárez, Ciudad de México, CDMX',
          reference: 'Torre corporativa, piso 15'
        },
        paymentMethod: {
          type: 'paypal',
          title: 'PayPal'
        },
        tracking: {
          number: 'TRK456789012',
          carrier: 'FedEx',
          status: 'in_transit'
        },
        createdAt: new Date('2024-01-15T14:20:00Z')
      },
      {
        user: user._id,
        items: [
          {
            product: {
              name: 'AirPods Pro 2da Gen',
              image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=300',
              price: 249.99
            },
            quantity: 1,
            price: 249.99
          }
        ],
        totalAmount: 249.99,
        status: 'processing',
        shippingAddress: {
          fullAddress: 'Av. Insurgentes Sur 1234, Col. Del Valle, Ciudad de México, CDMX',
          reference: 'Casa azul con portón negro'
        },
        paymentMethod: {
          type: 'debit_card',
          title: 'Mastercard **** 5678'
        },
        tracking: {
          number: 'TRK123456789',
          carrier: 'Estafeta',
          status: 'processing'
        },
        createdAt: new Date('2024-01-10T09:15:00Z')
      },
      {
        user: user._id,
        items: [
          {
            product: {
              name: 'Camiseta Nike Dri-FIT',
              image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300',
              price: 29.99
            },
            quantity: 2,
            price: 29.99
          },
          {
            product: {
              name: 'Shorts Nike Running',
              image: 'https://images.unsplash.com/photo-1506629905607-d9f02a6a0f7b?w=300',
              price: 39.99
            },
            quantity: 1,
            price: 39.99
          },
          {
            product: {
              name: 'Tenis Nike Air Max',
              image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',
              price: 129.99
            },
            quantity: 1,
            price: 129.99
          }
        ],
        totalAmount: 229.97,
        status: 'cancelled',
        shippingAddress: {
          fullAddress: 'Calle Madero 789, Centro Histórico, Ciudad de México, CDMX',
          reference: 'Casa de mis padres'
        },
        paymentMethod: {
          type: 'credit_card',
          title: 'Visa **** 1234'
        },
        tracking: {
          number: 'TRK987654321',
          carrier: 'Correos de México',
          status: 'cancelled'
        },
        createdAt: new Date('2024-01-05T16:45:00Z')
      },
      {
        user: user._id,
        items: [
          {
            product: {
              name: 'Monitor LG 27" 4K',
              image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300',
              price: 399.99
            },
            quantity: 1,
            price: 399.99
          },
          {
            product: {
              name: 'Teclado Mecánico RGB',
              image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=300',
              price: 89.99
            },
            quantity: 1,
            price: 89.99
          }
        ],
        totalAmount: 489.98,
        status: 'pending',
        shippingAddress: {
          fullAddress: 'Av. Insurgentes Sur 1234, Col. Del Valle, Ciudad de México, CDMX',
          reference: 'Casa azul con portón negro'
        },
        paymentMethod: {
          type: 'bank_transfer',
          title: 'Transferencia Bancaria'
        },
        tracking: {
          number: 'TRK555666777',
          carrier: 'Pendiente',
          status: 'pending'
        },
        createdAt: new Date('2024-01-25T11:00:00Z')
      }
    ];

    // Insertar pedidos
    await Order.insertMany(orders);
    console.log('✅ Pedidos reales creados');

    // Crear datos para usuario admin también
    let adminUser = await User.findOne({ email: 'admin@ejemplo.com' });
    
    if (!adminUser) {
      console.log('❌ Usuario admin no encontrado. Creando...');
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      adminUser = new User({
        email: 'admin@ejemplo.com',
        password: hashedPassword,
        firstName: 'María',
        lastName: 'González',
        phone: '+52 55 9876 5432',
        role: 'admin'
      });
      await adminUser.save();
      console.log('✅ Usuario admin creado');
    }

    // Agregar datos al admin
    adminUser.addresses = [
      {
        type: 'home',
        fullAddress: 'Av. Polanco 567, Col. Polanco, Ciudad de México, CDMX, México, CP 11560',
        reference: 'Edificio moderno, departamento 801',
        isPrimary: true
      }
    ];

    adminUser.paymentMethods = [
      {
        type: 'credit_card',
        title: '💳 Tarjeta Empresarial',
        cardNumber: '**** **** **** 9999',
        cardHolder: 'María González',
        expiryDate: '03/27',
        isPrimary: true
      }
    ];

    await adminUser.save();
    console.log('✅ Datos del admin actualizados');

    console.log('\n🎉 ¡Seeder completado exitosamente!');
    console.log('\n📊 Datos creados:');
    console.log(`👤 Usuario: ${user.firstName} ${user.lastName}`);
    console.log(`📍 Direcciones: ${user.addresses.length}`);
    console.log(`💳 Métodos de pago: ${user.paymentMethods.length}`);
    console.log(`📦 Pedidos: ${orders.length}`);
    console.log('\n🧪 Credenciales de prueba:');
    console.log('📧 Email: usuario@ejemplo.com');
    console.log('🔑 Password: password123');

  } catch (error) {
    console.error('❌ Error en el seeder:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
};

// Ejecutar seeder
const runSeeder = async () => {
  await connectDB();
  await seedProfileData();
};

runSeeder();