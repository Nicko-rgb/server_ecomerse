const bcrypt = require('bcryptjs');

// Script para generar contraseñas hasheadas
async function generatePasswords() {
  const password1 = await bcrypt.hash('password123', 10);
  const password2 = await bcrypt.hash('admin123', 10);
  const password3 = await bcrypt.hash('password123', 10);

  console.log('Contraseñas generadas:');
  console.log('Usuario 1 (usuario@ejemplo.com): password123');
  console.log('Hash:', password1);
  console.log('\nUsuario 2 (admin@ejemplo.com): admin123');
  console.log('Hash:', password2);
  console.log('\nUsuario 3 (maria@ejemplo.com): password123');
  console.log('Hash:', password3);
}

generatePasswords();