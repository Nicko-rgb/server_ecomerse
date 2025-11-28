require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize } = require('../models');
const User = require('../models/User');
const DataUser = require('../models/DataUser');

async function createAdmin() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');

    const adminEmail = 'admin@ecommerce.com';
    const adminPassword = 'admin123';

    // Verificar si ya existe
    const existing = await User.findOne({ where: { email: adminEmail } });
    
    if (existing) {
      // Actualizar a admin si ya existe
      await existing.update({ role: 'admin' });
      console.log(`✅ Usuario ${adminEmail} actualizado a admin`);
    } else {
      // Crear nuevo usuario admin
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      const admin = await User.create({
        email: adminEmail,
        password: hashedPassword,
        first_name: 'Admin',
        last_name: 'Sistema',
        phone: '1234567890',
        role: 'admin',
        active: true
      });

      await DataUser.create({ 
        user_id: admin.id_user, 
        addresses: [] 
      });

      console.log('✅ Usuario admin creado exitosamente');
    }

    console.log('\n📧 Email: admin@ecommerce.com');
    console.log('🔑 Password: admin123');
    console.log('\n⚠️  IMPORTANTE: Cambia esta contraseña después de iniciar sesión\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
